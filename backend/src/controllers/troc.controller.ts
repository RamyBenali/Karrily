import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../middleware/error.middleware.js";
import { createNotification } from "../config/notifications.js";

export class TrocController {
    /**
     * GET /api/troc — Get current user's troc proposals
     */
    getMyProposals = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const { role = "proposer" } = req.query;

            const field = role === "owner" ? "requested_owner_id" : "proposer_id";

            const { data, error } = await supabaseAdmin
                .from("troc_proposals")
                .select("*, requested_item:items!requested_item_id(*), offered_item:items!offered_item_id(*), proposer:profiles!proposer_id(*), owner:profiles!requested_owner_id(*)")
                .eq(field, userId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/troc — Create a new troc proposal
     */
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { requested_item_id, offered_item_id, offered_item_data, message, cash_complement, complement_payer } = req.body;
            const proposerId = req.user!.id;

            // Get item details
            const { data: requestedItem, error: itemError } = await supabaseAdmin
                .from("items")
                .select("*")
                .eq("id", requested_item_id)
                .single();

            if (itemError || !requestedItem) {
                throw new ApiError(404, "Requested item not found");
            }

            if (requestedItem.owner_id === proposerId) {
                throw new ApiError(400, "You cannot propose a troc for your own item");
            }

            const { data, error } = await supabaseAdmin
                .from("troc_proposals")
                .insert({
                    requested_item_id,
                    requested_owner_id: requestedItem.owner_id,
                    proposer_id: proposerId,
                    offered_item_id: offered_item_id || null,
                    offered_item_data: offered_item_data || {},
                    message,
                    cash_complement: cash_complement || 0,
                    complement_payer: complement_payer || 'proposer',
                    status: "pending"
                })
                .select()
                .single();

            if (error) throw error;

            // Notify requested owner
            await createNotification(
                requestedItem.owner_id,
                "Nouvelle proposition de troc",
                `L'utilisateur ${req.user!.full_name} vous propose un échange pour "${requestedItem.title}".`,
                "troc_proposal"
            );

            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/troc/:id/status — Update troc status
     */
    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user!.id;

            const validStatuses = ["accepted", "rejected", "counter", "completed", "cancelled"];
            if (!validStatuses.includes(status)) {
                throw new ApiError(400, `Invalid status.`);
            }

            const { data: proposal } = await supabaseAdmin
                .from("troc_proposals")
                .select("requested_owner_id, proposer_id, requested_item_id, offered_item_id")
                .eq("id", id)
                .single();

            if (!proposal) {
                throw new ApiError(404, "Proposal not found");
            }

            if (proposal.requested_owner_id !== userId && proposal.proposer_id !== userId) {
                throw new ApiError(403, "Access denied");
            }

            const { data, error } = await supabaseAdmin
                .from("troc_proposals")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            // Notify proposer
            const statusLabels: Record<string, string> = {
                accepted: "acceptée",
                rejected: "refusée",
                completed: "finalisée",
                cancelled: "annulée",
                counter: "avec une contre-proposition"
            };
            
            let notificationType: 'troc_accepted' | 'troc_rejected' | 'troc_proposal' = 'troc_proposal';
            if (status === 'accepted' || status === 'completed') {
                notificationType = 'troc_accepted';
            } else if (status === 'rejected' || status === 'cancelled') {
                notificationType = 'troc_rejected';
            }

            await createNotification(
                proposal.proposer_id,
                `Proposition de troc ${statusLabels[status] || status}`,
                `Votre offre d'échange pour l'objet a été mise à jour : ${statusLabels[status] || status}.`,
                notificationType
            );

            // If completed, mark items as traded
            if (status === "completed") {
                await supabaseAdmin
                    .from("items")
                    .update({ status: "sold" }) // Or 'traded', but 'sold' works for removing from search
                    .in("id", [proposal.requested_item_id, proposal.offered_item_id].filter(Boolean));
            }

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
