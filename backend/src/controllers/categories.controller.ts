import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../middleware/error.middleware.js";

export class CategoriesController {
    /**
     * GET /api/categories
     */
    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { data, error } = await supabaseAdmin
                .from("categories")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/categories/:slug
     */
    getBySlug = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { slug } = req.params;

            const { data: category, error } = await supabaseAdmin
                .from("categories")
                .select("*")
                .eq("slug", slug)
                .single();

            if (error || !category) {
                throw new ApiError(404, "Category not found");
            }

            // Get items in this category
            const { data: items, error: itemsError } = await supabaseAdmin
                .from("items")
                .select("*, owner:profiles(*)")
                .eq("category_id", category.id)
                .eq("is_available", true)
                .order("created_at", { ascending: false });

            if (itemsError) throw itemsError;

            res.json({
                success: true,
                data: {
                    ...category,
                    items,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}
