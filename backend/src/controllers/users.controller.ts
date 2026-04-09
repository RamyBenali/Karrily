import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../middleware/error.middleware.js";

export class UsersController {
    /**
     * GET /api/users/:id — Public profile
     */
    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabaseAdmin
                .from("profiles")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                throw new ApiError(404, "User not found");
            }

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/users/me — Update own profile
     */
    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const { full_name, bio, phone, location, avatar_url } = req.body;

            const { data, error } = await supabaseAdmin
                .from("profiles")
                .update({
                    full_name,
                    bio,
                    phone,
                    location,
                    avatar_url,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", userId)
                .select()
                .single();

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/users/:id/items — Items listed by user
     */
    getUserItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabaseAdmin
                .from("items")
                .select("*, category:categories(*)")
                .eq("owner_id", id)
                .eq("is_available", true)
                .order("created_at", { ascending: false });

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/users/:id/reviews — Reviews for user
     */
    getUserReviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabaseAdmin
                .from("reviews")
                .select("*, reviewer:profiles!reviewer_id(*), item:items(*)")
                .eq("item.owner_id", id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
