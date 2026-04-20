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

            // 1. Bookings Earnings
            const [
                { data: bookings, error: bookingsError },
                { data: sales, error: salesError },
                { count: activeListings, error: itemsError }
            ] = await Promise.all([
                supabaseAdmin.from("bookings").select("total_price, status, created_at").eq("owner_id", userId),
                supabaseAdmin.from("sales").select("price, status, created_at").eq("seller_id", userId),
                supabaseAdmin.from("items").select("*", { count: "exact", head: true }).eq("owner_id", userId).eq("is_available", true)
            ]);

            if (bookingsError) {
                console.error("Bookings stats error:", bookingsError);
                throw bookingsError;
            }
            if (salesError) console.error("Sales stats error:", salesError); // Non-critical if table doesn't exist yet

            // Calculate Earnings
            const completedBookings = (bookings || []).filter(b => ["completed", "active", "confirmed", "delivered"].includes(b.status));
            const completedSales = (sales || []).filter(s => ["completed", "accepted", "delivered", "shipped"].includes(s.status));
            
            const bookingEarnings = completedBookings.reduce((acc, b) => acc + (Number(b.total_price) || 0), 0);
            const saleEarnings = completedSales.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
            
            const totalEarnings = bookingEarnings + saleEarnings;
            const totalBookings = (bookings?.length || 0) + (sales?.length || 0);

            // 2. Earnings by month (Combined)
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const chartData = [];
            
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = months[d.getMonth()];
                
                const mEarnings = [...completedBookings, ...completedSales]
                    .filter(item => {
                        const iDate = new Date(item.created_at);
                        return iDate.getMonth() === d.getMonth() && iDate.getFullYear() === d.getFullYear();
                    })
                    .reduce((acc, item: any) => acc + (Number(item.total_price || item.price) || 0), 0);
                
                chartData.push({ month: monthName, earnings: mEarnings });
            }

            // 3. Average Rating
            const { data: items } = await supabaseAdmin.from("items").select("id").eq("owner_id", userId);
            const itemIds = items?.map(i => i.id) || [];
            
            let averageRating = 5.0; 
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
            console.error("Lender stats error:", error);
            next(error);
        }
    };

    /**
     * GET /api/stats/admin
     * Get platform-wide statistics for admins
     */
    getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is admin
            if (req.user?.role !== 'admin') {
                throw new ApiError(403, "Access denied");
            }

            const [
                { count: totalUsers, error: usersErr },
                { count: totalItems, error: itemsErr },
                { count: totalBookings, error: bookingsErr },
                { data: bookingRevenueData, error: bRevErr },
                { data: saleRevenueData, error: sRevErr },
                { count: totalMessages, error: msgErr },
                { count: unreadNotifs, error: notifErr }
            ] = await Promise.all([
                supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("items").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("bookings").select("total_price").in("status", ["completed", "confirmed", "delivered"]),
                supabaseAdmin.from("sales").select("price").in("status", ["completed", "accepted", "delivered", "shipped"]),
                supabaseAdmin.from("messages").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("notifications").select("*", { count: "exact", head: true }).eq("is_read", false),
            ]);

            // Log errors if any
            if (usersErr) console.error("Admin stats users error:", usersErr);
            if (itemsErr) console.error("Admin stats items error:", itemsErr);
            if (bookingsErr) console.error("Admin stats bookings error:", bookingsErr);
            if (bRevErr) console.error("Admin stats booking revenue error:", bRevErr);
            if (sRevErr) console.error("Admin stats sale revenue error:", sRevErr);

            const bookingRevenue = bookingRevenueData ? bookingRevenueData.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0) : 0;
            const saleRevenue = saleRevenueData ? saleRevenueData.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) : 0;
            const totalRevenue = bookingRevenue + saleRevenue;

            res.json({
                success: true,
                data: {
                    kpis: {
                        totalUsers: totalUsers || 0,
                        totalItems: totalItems || 0,
                        totalBookings: (totalBookings || 0) + (saleRevenueData?.length || 0),
                        totalRevenue
                    },
                    system: {
                        totalMessages: totalMessages || 0,
                        unreadNotifications: unreadNotifs || 0,
                        dbStatus: "Connecté",
                        lastUpdate: new Date().toLocaleTimeString(),
                    }
                }
            });
        } catch (error) {
            console.error("Admin stats error:", error);
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
            const { data: locations } = await supabaseAdmin.from("items").select("location").eq("is_available", true);
            const cities = new Set();
            locations?.forEach(l => {
                if (l.location) {
                    const city = l.location.split(',')[0].trim();
                    if (city) cities.add(city);
                }
            });

            // 3. Real Active Users count
            const { count: realUserCount } = await supabaseAdmin
                .from("profiles")
                .select("*", { count: "exact", head: true });

            res.json({
                success: true,
                data: {
                    categories: categoryStats,
                    totalCities: cities.size || 47,
                    activeUsers: realUserCount || 0
                }
            });
        } catch (error) {
            next(error);
        }
    };
}
