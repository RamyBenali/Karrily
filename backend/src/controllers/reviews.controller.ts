import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../middleware/error.middleware.js";

export class ReviewsController {
    /**
     * DELETE /api/reviews/:id
     * Delete a review (Admin or Owner)
     */
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            // Get review first to check ownership if not admin
            const { data: review } = await supabaseAdmin
                .from("reviews")
                .select("reviewer_id")
                .eq("id", id)
                .single();

            if (!review) {
                throw new ApiError(404, "Avis introuvable.");
            }

            if (req.user!.role !== 'admin' && review.reviewer_id !== req.user!.id) {
                throw new ApiError(403, "Vous n'avez pas l'autorisation de supprimer cet avis.");
            }

            const { error } = await supabaseAdmin
                .from("reviews")
                .delete()
                .eq("id", id);

            if (error) throw error;

            res.json({ success: true, message: "Avis supprimé avec succès." });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/reviews/:id/dismiss-report
     * Dismiss a report on a review (Admin only)
     */
    dismissReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            if (req.user!.role !== 'admin') {
                throw new ApiError(403, "Accès réservé aux administrateurs.");
            }

            // Execute both updates
            const { error: reviewError } = await supabaseAdmin
                .from("reviews")
                .update({ is_reported: false })
                .eq("id", id);

            if (reviewError) throw reviewError;

            // Update reports in background (don't block the main response if possible, but let's await for reliability here)
            await supabaseAdmin
                .from("reports")
                .update({ 
                    status: "resolved",
                    resolved_at: new Date().toISOString(),
                    resolved_by: req.user!.id,
                    admin_notes: "Validé via modération"
                })
                .eq("reported_review_id", id);

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    };
}
