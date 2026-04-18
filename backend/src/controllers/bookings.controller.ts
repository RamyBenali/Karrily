import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../middleware/error.middleware.js";
import { createNotification } from "../config/notifications.js";

export class BookingsController {
    /**
     * GET /api/bookings — Get current user's bookings
     */
    getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const { status, role = "renter" } = req.query;

            const field = role === "owner" ? "owner_id" : "renter_id";

            let query = supabaseAdmin
                .from("bookings")
                .select("*, item:items(*, category:categories(*)), renter:profiles!renter_id(*), owner:profiles!owner_id(*)")
                .eq(field, userId)
                .order("created_at", { ascending: false });

            if (status) query = query.eq("status", status);

            const { data, error } = await query;

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/bookings/:id
     */
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            const { data, error } = await supabaseAdmin
                .from("bookings")
                .select("*, item:items(*, category:categories(*)), renter:profiles!renter_id(*), owner:profiles!owner_id(*)")
                .eq("id", id)
                .single();

            if (error || !data) {
                throw new ApiError(404, "Booking not found");
            }

            // Only the renter or owner can view
            if (data.renter_id !== userId && data.owner_id !== userId) {
                throw new ApiError(403, "Access denied");
            }

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/bookings
     */
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { item_id, start_date, end_date, message } = req.body;
            const renterId = req.user!.id;

            // Get item details
            const { data: item, error: itemError } = await supabaseAdmin
                .from("items")
                .select("*")
                .eq("id", item_id)
                .single();

            if (itemError || !item) {
                throw new ApiError(404, "Item not found");
            }

            if (item.owner_id === renterId) {
                throw new ApiError(400, "You cannot book your own item");
            }

            // Calculate total price
            const start = new Date(start_date);
            const end = new Date(end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            if (days <= 0) {
                throw new ApiError(400, "End date must be after start date");
            }

            // Backend Check: Overlapping Bookings
            const { data: overlappingBookings, error: overlapError } = await supabaseAdmin
                .from("bookings")
                .select("id")
                .eq("item_id", item_id)
                .in("status", ["confirmed", "active"])
                .lte("start_date", end_date)
                .gte("end_date", start_date);

            if (overlapError) throw overlapError;
            if (overlappingBookings && overlappingBookings.length > 0) {
                throw new ApiError(409, "These dates are already booked for this item");
            }


            const total_price = days * item.price_per_day;

            const { data, error } = await supabaseAdmin
                .from("bookings")
                .insert({
                    item_id,
                    renter_id: renterId,
                    owner_id: item.owner_id,
                    start_date,
                    end_date,
                    total_price,
                    message,
                    status: "pending",
                    payment_status: "pending",
                    price_per_day: item.price_per_day,
                })
                .select()
                .single();

            if (error) throw error;

            // Notify owner
            await createNotification(
                item.owner_id,
                "Nouvelle demande de location",
                `Vous avez reçu une demande pour "${item.title}" par ${req.user!.full_name}.`,
                "booking_request"
            );

            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/bookings/:id/status
     */
    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user!.id;

            const validStatuses = ["confirmed", "active", "completed", "cancelled", "rejected"];
            if (!validStatuses.includes(status)) {
                throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
            }

            // Verify the user is the owner of the item
            const { data: booking } = await supabaseAdmin
                .from("bookings")
                .select("owner_id, renter_id")
                .eq("id", id)
                .single();

            if (!booking) {
                throw new ApiError(404, "Booking not found");
            }

            if (booking.owner_id !== userId && booking.renter_id !== userId) {
                throw new ApiError(403, "Access denied");
            }

            const { data, error } = await supabaseAdmin
                .from("bookings")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            // Notify renter of status change
            if (status !== "pending") {
                const statusLabels: Record<string, string> = {
                    confirmed: "confirmée",
                    active: "en cours (remise effectuée)",
                    completed: "terminée",
                    cancelled: "annulée",
                    rejected: "refusée"
                };
                
                let notificationType: 'booking_confirmed' | 'booking_cancelled' = 'booking_confirmed';
                if (status === 'cancelled' || status === 'rejected') {
                    notificationType = 'booking_cancelled';
                }

                await createNotification(
                    booking.renter_id,
                    `Réservation ${statusLabels[status] || status}`,
                    `Le statut de votre réservation a été mis à jour : ${statusLabels[status] || status}.`,
                    notificationType
                );
            }

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/bookings/:id
     */
    cancel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            const { data: booking } = await supabaseAdmin
                .from("bookings")
                .select("renter_id, status")
                .eq("id", id)
                .single();

            if (!booking) {
                throw new ApiError(404, "Booking not found");
            }

            if (booking.renter_id !== userId) {
                throw new ApiError(403, "Only the renter can cancel a booking");
            }

            if (booking.status === "active" || booking.status === "completed") {
                throw new ApiError(400, "Cannot cancel an active or completed booking");
            }

            const { data, error } = await supabaseAdmin
                .from("bookings")
                .update({ status: "cancelled", updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
