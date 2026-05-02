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
            let requestingUserId: string | null = null;

            // Check if there is a bearer token
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                const token = authHeader.split(" ")[1];
                const { data: { user } } = await supabaseAdmin.auth.getUser(token);
                if (user) requestingUserId = user.id;
            }

            let query = supabaseAdmin
                .from("items")
                .select("*, category:categories(*)")
                .eq("owner_id", id)
                .order("created_at", { ascending: false });

            // If the user requesting is not the owner, only show available items
            if (requestingUserId !== id) {
                query = query.eq("is_available", true);
            }

            const { data, error } = await query;

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
    /**
     * PUT /api/users/:id/role — Update user role (admin only)
     */
    updateRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.user?.role !== 'admin') {
                throw new ApiError(403, "Access denied");
            }
            const { id } = req.params;
            const { role } = req.body;

            console.log(`Admin ${req.user.id} updating role for user ${id} to ${role}`);

            // 1. Update Profile table
            const { data: profile, error: profileError } = await supabaseAdmin
                .from("profiles")
                .update({ role })
                .eq("id", id)
                .select()
                .single();

            if (profileError) {
                console.error("Error updating profile role:", profileError);
                throw profileError;
            }

            // 2. Update Auth Metadata (optional but recommended for consistency)
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
                user_metadata: { role }
            });

            if (authError) {
                console.warn("Could not update auth metadata, but profile was updated:", authError.message);
            }

            res.json({ success: true, data: profile });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/users/:id — Delete user (admin only)
     */
    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.user?.role !== 'admin') {
                throw new ApiError(403, "Access denied");
            }
            const { id } = req.params;

            // Delete from Auth (this cascades to profiles if setup correctly, but doing both is safe)
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id as string);
            if (authError) console.error("Error deleting auth user:", authError);

            const { error: profileError } = await supabaseAdmin
                .from("profiles")
                .delete()
                .eq("id", id);
            
            if (profileError) throw profileError;

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    };
}
