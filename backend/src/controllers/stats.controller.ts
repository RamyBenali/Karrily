import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../middleware/error.middleware.js";

export class StatsController {
    /**
     * GET /api/stats/lender
     * Get statistics for the authenticated lender
     */
    getLenderStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;

            // 1. Total Earnings & Total Bookings
            const { data: bookings, error: bookingsError } = await supabaseAdmin
                .from("bookings")
                .select("total_price, status, created_at")
                .eq("owner_id", userId);

            if (bookingsError) throw bookingsError;

            const completedBookings = bookings.filter(b => b.status === "completed");
            const totalEarnings = completedBookings.reduce((acc, b) => acc + (Number(b.total_price) || 0), 0);
            const totalBookings = bookings.length;

            // 2. Earnings by month (Last 6 months)
            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 5);
            sixMonthsAgo.setDate(1);
            sixMonthsAgo.setHours(0, 0, 0, 0);

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const chartData = [];
            
            for (let i = 0; i < 6; i++) {
                const d = new Date(sixMonthsAgo);
                d.setMonth(sixMonthsAgo.getMonth() + i);
                const monthName = months[d.getMonth()];
                
                const monthEarnings = completedBookings
                    .filter(b => {
                        const bDate = new Date(b.created_at);
                        return bDate.getMonth() === d.getMonth() && bDate.getFullYear() === d.getFullYear();
                    })
                    .reduce((acc, b) => acc + (Number(b.total_price) || 0), 0);
                
                chartData.push({ month: monthName, earnings: monthEarnings });
            }

            // 3. Active Listings
            const { count: activeListings, error: itemsError } = await supabaseAdmin
                .from("items")
                .select("*", { count: "exact", head: true })
                .eq("owner_id", userId)
                .eq("status", "active");

            if (itemsError) throw itemsError;

            // 4. Average Rating
            // Note: In a real app, you might want to join or have a cached rating on profiles/items.
            // Here we'll query reviews for items owned by the user.
            const { data: items } = await supabaseAdmin.from("items").select("id").eq("owner_id", userId);
            const itemIds = items?.map(i => i.id) || [];
            
            let averageRating = 5.0; // Default
            if (itemIds.length > 0) {
                const { data: reviews } = await supabaseAdmin
                    .from("reviews")
                    .select("rating")
                    .in("item_id", itemIds);
                
                if (reviews && reviews.length > 0) {
                    averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                }
            }

            res.json({
                success: true,
                data: {
                    totalEarnings,
                    totalBookings,
                    activeListings: activeListings || 0,
                    averageRating: parseFloat(averageRating.toFixed(1)),
                    earningsData: chartData
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/stats/admin
     * Get platform-wide statistics for admins
     */
    getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is admin (this should be handled by middleware too, but let's be safe)
            if (req.user?.role !== 'admin') {
                throw new ApiError(403, "Access denied");
            }

            const [
                { count: totalUsers },
                { count: totalItems },
                { count: totalBookings },
                { data: revenueData },
                { count: totalMessages },
                { count: unreadNotifs }
            ] = await Promise.all([
                supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("items").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("bookings").select("total_price").eq("status", "completed"),
                supabaseAdmin.from("messages").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("notifications").select("*", { count: "exact", head: true }).eq("is_read", false),
            ]);

            const totalRevenue = revenueData ? revenueData.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0) : 0;

            res.json({
                success: true,
                data: {
                    kpis: {
                        totalUsers: totalUsers || 0,
                        totalItems: totalItems || 0,
                        totalBookings: totalBookings || 0,
                        totalRevenue
                    },
                    system: {
                        totalMessages: totalMessages || 0,
                        unreadNotifications: unreadNotifs || 0,
                        dbConnections: 120, // Static for now as placeholder for "Health"
                        apiLatency: "18ms", // Static for now
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/stats/global
     * Get global stats for landing page (public)
     */
    getGlobalStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Category counts
            const { data: categories } = await supabaseAdmin.from("categories").select("id, name, slug");
            
            const categoryStats = await Promise.all((categories || []).map(async (cat) => {
                const { count } = await supabaseAdmin
                    .from("items")
                    .select("*", { count: "exact", head: true })
                    .eq("category_id", cat.id)
                    .eq("status", "active");
                
                return {
                    ...cat,
                    count: count || 0
                };
            }));

            // 2. Active cities
            const { data: locations } = await supabaseAdmin.from("items").select("location").eq("status", "active");
            const cities = new Set();
            locations?.forEach(l => {
                if (l.location) {
                    const city = l.location.split(',')[0].trim();
                    if (city) cities.add(city);
                }
            });

            res.json({
                success: true,
                data: {
                    categories: categoryStats,
                    totalCities: cities.size || 47, // Default to 47 if none found
                    activeUsers: 1200 // Static placeholder
                }
            });
        } catch (error) {
            next(error);
        }
    };
}
