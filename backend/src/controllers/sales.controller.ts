import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../middleware/error.middleware.js";
import { createNotification } from "../config/notifications.js";

export class SalesController {
    /**
     * GET /api/sales — Get current user's sales (as buyer or seller)
     */
    getMySales = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const { role = "buyer" } = req.query;

            const field = role === "seller" ? "seller_id" : "buyer_id";

            const { data, error } = await supabaseAdmin
                .from("sales")
                .select("*, item:items(*), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)")
                .eq(field, userId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/sales — Create a new sale request
     */
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { item_id, message } = req.body;
            const buyerId = req.user!.id;

            // Get item details
            const { data: item, error: itemError } = await supabaseAdmin
                .from("items")
                .select("*")
                .eq("id", item_id)
                .single();

            if (itemError || !item) {
                throw new ApiError(404, "Item not found");
            }

            if (item.owner_id === buyerId) {
                throw new ApiError(400, "You cannot buy your own item");
            }

            const { data, error } = await supabaseAdmin
                .from("sales")
                .insert({
                    item_id,
                    buyer_id: buyerId,
                    seller_id: item.owner_id,
                    price: item.sale_price,
                    message,
                    status: "pending"
                })
                .select()
                .single();

            if (error) throw error;

            // Notify seller
            await createNotification(
                item.owner_id,
                "Nouvelle demande d'achat",
                `L'utilisateur ${req.user!.full_name} souhaite acheter "${item.title}".`,
                "sale"
            );

            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/sales/:id/status — Update sale status
     */
    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status, delivery_info } = req.body;
            const userId = req.user!.id;

            const validStatuses = ["accepted", "completed", "cancelled", "rejected"];
            if (!validStatuses.includes(status)) {
                throw new ApiError(400, `Invalid status.`);
            }

            // Verify the user is the owner or buyer
            const { data: sale } = await supabaseAdmin
                .from("sales")
                .select("seller_id, buyer_id, item_id")
                .eq("id", id)
                .single();

            if (!sale) {
                throw new ApiError(404, "Sale request not found");
            }

            if (sale.seller_id !== userId && sale.buyer_id !== userId) {
                throw new ApiError(403, "Access denied");
            }

            const updateData: any = { status, updated_at: new Date().toISOString() };
            if (delivery_info) updateData.delivery_info = delivery_info;

            const { data, error } = await supabaseAdmin
                .from("sales")
                .update(updateData)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            // Notify buyer
            const statusLabels: Record<string, string> = {
                accepted: "acceptée",
                completed: "finalisée",
                cancelled: "annulée",
                rejected: "refusée"
            };
            
            await createNotification(
                sale.buyer_id,
                `Vente ${statusLabels[status] || status}`,
                `Votre demande d'achat pour l'objet a été mise à jour : ${statusLabels[status] || status}.`,
                "sale"
            );

            // If completed, mark item as sold
            if (status === "completed") {
                await supabaseAdmin
                    .from("items")
                    .update({ is_sold: true, status: "sold" })
                    .eq("id", sale.item_id);
            }

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
