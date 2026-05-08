import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../middleware/error.middleware.js";

export class ItemsController {
    /**
     * GET /api/items
     */
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                page = "1",
                limit = "12",
                category,
                minPrice,
                maxPrice,
                location,
                condition,
                search,
                sortBy = "created_at",
                sortOrder = "desc",
                type,
            } = req.query;

            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);
            const offset = (pageNum - 1) * limitNum;

            let query = supabaseAdmin
                .from("items")
                .select("*, category:categories(*), owner:profiles(*)", { count: "exact" })
                .eq("status", "active")
                .eq("is_available", true)
                .range(offset, offset + limitNum - 1)
                .order(sortBy as string, { ascending: sortOrder === "asc" });

            if (category) query = query.eq("category_id", category);
            if (type === 'sell') {
                if (minPrice) query = query.gte("sale_price", minPrice);
                if (maxPrice) query = query.lte("sale_price", maxPrice);
            } else if (type === 'rent') {
                if (minPrice) query = query.gte("price_per_day", minPrice);
                if (maxPrice) query = query.lte("price_per_day", maxPrice);
            } else if (type === 'rent_sell') {
                // For mixed, we check if either price matches the range
                // Note: Complex OR filtering with range might be tricky with PostgREST, 
                // but usually we prioritize price_per_day for filtering in mixed mode
                if (minPrice) query = query.gte("price_per_day", minPrice);
                if (maxPrice) query = query.lte("price_per_day", maxPrice);
            } else if (type === 'troc') {
                // No price filter for troc usually, unless searching by estimated value
            } else {
                // Default fallback: if no type specified, we check price_per_day (primary for this app)
                // but only if it's not NULL, or we handle it gracefully
                if (minPrice) query = query.gte("price_per_day", minPrice);
                if (maxPrice) query = query.lte("price_per_day", maxPrice);
            }

            if (location) query = query.ilike("location", `%${location}%`);
            if (condition) query = query.eq("condition", condition);
            if (type) query = query.eq("listing_type", type);
            if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

            const { data, error, count } = await query;

            if (error) throw error;

            res.json({
                success: true,
                data,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limitNum),
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/items/featured
     */
    getFeatured = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            let { data, error } = await supabaseAdmin
                .from("items")
                .select("*, category:categories(*), owner:profiles(*)")
                .eq("is_available", true)
                .eq("status", "active")
                .eq("is_premium", true)
                .order("rating", { ascending: false })
                .limit(8);

            if (error) throw error;

            // Fallback: If no premium items, get latest active items
            if (!data || data.length === 0) {
                const { data: latest, error: fallbackError } = await supabaseAdmin
                    .from("items")
                    .select("*, category:categories(*), owner:profiles(*)")
                    .eq("is_available", true)
                    .eq("status", "active")
                    .order("created_at", { ascending: false })
                    .limit(8);
                
                if (fallbackError) throw fallbackError;
                data = latest;
            }

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/items/search
     */
    search = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { q, limit = "20" } = req.query;

            if (!q) {
                throw new ApiError(400, "Search query is required");
            }

            const { data, error } = await supabaseAdmin
                .from("items")
                .select("*, category:categories(*), owner:profiles(*)")
                .eq("is_available", true)
                .or(`title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`)
                .limit(parseInt(limit as string, 10));

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/items/:id
     */
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabaseAdmin
                .from("items")
                .select("*, category:categories(*), owner:profiles(*)")
                .eq("id", id)
                .single();

            if (error || !data) {
                throw new ApiError(404, "Item not found");
            }

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/items
     */
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const itemData = {
                ...req.body,
                owner_id: req.user!.id,
                is_available: true,
            };

            const { data, error } = await supabaseAdmin
                .from("items")
                .insert(itemData)
                .select()
                .single();

            if (error) {
                console.error(" Supabase Item Insert Error:", {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    dataSent: itemData
                });
                throw new ApiError(400, `Erreur lors de la création: ${error.message}`);
            }

            res.status(201).json({ success: true, data });
        } catch (error) {
            console.error("ItemsController.create catch:", error);
            next(error);
        }
    };

    /**
     * PUT /api/items/:id
     */
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { data: existing } = await supabaseAdmin
                .from("items")
                .select("owner_id")
                .eq("id", id)
                .single();

            if (!existing) {
                throw new ApiError(404, "Item not found");
            }

            if (existing.owner_id !== req.user!.id && req.user!.role !== 'admin') {
                throw new ApiError(403, "You can only update your own items");
            }

            const { data, error } = await supabaseAdmin
                .from("items")
                .update({ ...req.body, updated_at: new Date().toISOString() })
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
     * DELETE /api/items/:id
     */
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { data: existing, error: fetchError } = await supabaseAdmin
                .from("items")
                .select("owner_id")
                .eq("id", id)
                .single();

            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    throw new ApiError(404, "Cet article n'existe pas ou a déjà été supprimé.");
                }
                throw fetchError;
            }

            if (existing.owner_id !== req.user!.id && req.user!.role !== 'admin') {
                throw new ApiError(403, "Vous n'avez pas l'autorisation de supprimer cet article.");
            }

            const { error: deleteError } = await supabaseAdmin
                .from("items")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            res.json({ success: true, data: { message: "Article supprimé avec succès." } });
        } catch (error) {
            console.error("ItemsController.delete error:", error);
            next(error);
        }
    };
}
