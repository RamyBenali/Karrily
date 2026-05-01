import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../middleware/error.middleware.js";

export class ReportsController {
    /**
     * POST /api/reports
     * Create a new report
     */
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { reported_item_id, reported_user_id, reported_review_id, reason, description } = req.body;
            const reporter_id = req.user!.id;

            if (!reason) {
                throw new ApiError(400, "Le motif du signalement est requis.");
            }

            if (!reported_item_id && !reported_user_id && !reported_review_id) {
                throw new ApiError(400, "Vous devez spécifier l'élément à signaler.");
            }

            const { data, error } = await supabaseAdmin
                .from("reports")
                .insert({
                    reporter_id,
                    reported_item_id,
                    reported_user_id,
                    reported_review_id,
                    reason,
                    description,
                    status: "pending"
                })
                .select()
                .single();

            if (error) throw error;

            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/reports
     * Get all reports (Admin only)
     */
    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { data, error } = await supabaseAdmin
                .from("reports")
                .select(`
                    *,
                    reporter:profiles!reporter_id(full_name, email),
                    item:items!reported_item_id(title, id),
                    review:reviews!reported_review_id(comment, id),
                    reported_user:profiles!reported_user_id(full_name, email)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/reports/:id/status
     * Update report status (Admin only)
     */
    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status, admin_notes } = req.body;

            const { data, error } = await supabaseAdmin
                .from("reports")
                .update({ 
                    status, 
                    admin_notes,
                    resolved_at: status !== "pending" ? new Date().toISOString() : null,
                    resolved_by: status !== "pending" ? req.user!.id : null
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/reports/:id
     * Delete a report (Admin only)
     */
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            const { error } = await supabaseAdmin
                .from("reports")
                .delete()
                .eq("id", id);

            if (error) throw error;

            res.json({ success: true, message: "Signalement supprimé." });
        } catch (error) {
            next(error);
        }
    };
}
