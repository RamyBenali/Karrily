import { supabase } from "../lib/supabase";

// ─── Items Service ───────────────────────────────────

export const itemsService = {
    getAll: async (params?: Record<string, any>) => {
        let query = supabase
            .from("items")
            .select("*, category:categories(*), owner:profiles(*)", { count: "exact" });

        if (params?.category_id) query = query.eq("category_id", params.category_id);
        if (params?.status) query = query.eq("status", params.status);
        if (params?.is_available !== undefined) query = query.eq("is_available", params.is_available);

        const { data, error, count } = await query.order("created_at", { ascending: false });
        if (error) throw error;
        return { data, success: true, count };
    },

    getFeatured: async () => {
        const { data, error } = await supabase
            .from("items")
            .select("*, category:categories(*), owner:profiles(*)")
            .eq("is_available", true)
            .eq("status", "active")
            .order("rating", { ascending: false })
            .limit(8);
        if (error) throw error;
        return { data, success: true };
    },

    search: async (q: string) => {
        const { data, error } = await supabase
            .from("items")
            .select("*, category:categories(*), owner:profiles(*)")
            .eq("is_available", true)
            .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
            .limit(20);
        if (error) throw error;
        return { data, success: true };
    },

    getById: async (id: string) => {
        const { data, error } = await supabase
            .from("items")
            .select("*, category:categories(*), owner:profiles(*)")
            .eq("id", id)
            .single();
        if (error) throw error;
        return { data, success: true };
    },

    create: async (itemData: Record<string, any>) => {
        const { data, error } = await supabase
            .from("items")
            .insert(itemData)
            .select()
            .single();
        if (error) throw error;
        return { data, success: true };
    },

    update: async (id: string, itemData: Record<string, any>) => {
        const { data, error } = await supabase
            .from("items")
            .update(itemData)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return { data, success: true };
    },

    delete: async (id: string) => {
        const { error } = await supabase
            .from("items")
            .delete()
            .eq("id", id);
        if (error) throw error;
        return { success: true };
    },
};

// ─── Bookings Service ────────────────────────────────

export const bookingsService = {
    getMyBookings: async (params?: Record<string, string>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        let query = supabase
            .from("bookings")
            .select("*, item:items(*)")
            .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`);

        if (params?.status) query = query.eq("status", params.status);

        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) throw error;
        return { data, success: true };
    },

    getById: async (id: string) => {
        const { data, error } = await supabase
            .from("bookings")
            .select("*, item:items(*), user:profiles(*)")
            .eq("id", id)
            .single();
        if (error) throw error;
        return { data, success: true };
    },

    create: async (data: { item_id: string; start_date: string; end_date: string; message?: string }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        // Get item property to know owner_id
        const { data: item } = await supabase.from("items").select("owner_id").eq("id", data.item_id).single();
        if (!item) throw new Error("Objet introuvable");

        const { data: booking, error } = await supabase
            .from("bookings")
            .insert({
                ...data,
                user_id: user.id,
                owner_id: item.owner_id,
                status: "pending"
            })
            .select()
            .single();

        if (error) throw error;
        return { data: booking, success: true };
    },

    updateStatus: async (id: string, status: string) => {
        const { data, error } = await supabase
            .from("bookings")
            .update({ status })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return { data, success: true };
    },

    cancel: async (id: string) => {
        const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("id", id);
        if (error) throw error;
        return { success: true };
    },
};

// ─── Categories Service ──────────────────────────────

export const categoriesService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("is_active", true)
            .order("sort_order");
        if (error) throw error;
        return { data, success: true };
    },

    getBySlug: async (slug: string) => {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("slug", slug)
            .single();
        if (error) throw error;
        return { data, success: true };
    },
};

// ─── Users Service ───────────────────────────────────

export const usersService = {
    getProfile: async (id: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return { data, success: true };
    },

    updateProfile: async (data: Record<string, any>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        const { data: profile, error } = await supabase
            .from("profiles")
            .update(data)
            .eq("id", user.id)
            .select()
            .single();

        if (error) throw error;
        return { data: profile, success: true };
    },

    getUserItems: async (userId: string) => {
        const { data, error } = await supabase
            .from("items")
            .select("*, category:categories(*)")
            .eq("owner_id", userId)
            .order("created_at", { ascending: false });
        if (error) throw error;
        return { data, success: true };
    },

    getUserReviews: async (userId: string) => {
        const { data, error } = await supabase
            .from("reviews")
            .select("*, reviewer:profiles(*)")
            .eq("reviewed_id", userId)
            .order("created_at", { ascending: false });
        if (error) throw error;
        return { data, success: true };
    },
};

// ─── Sales Service ───────────────────────────────────

export const salesService = {
    getMySales: async (params?: Record<string, string>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        let query = supabase
            .from("sales")
            .select("*, item:items(*), buyer:profiles(*), seller:profiles(*)")
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (params?.status) query = query.eq("status", params.status);

        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) throw error;
        return { data, success: true };
    },

    create: async (data: { item_id: string; message?: string }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        const { data: item } = await supabase.from("items").select("owner_id").eq("id", data.item_id).single();
        if (!item) throw new Error("Objet introuvable");

        const { data: sale, error } = await supabase
            .from("sales")
            .insert({
                item_id: data.item_id,
                buyer_id: user.id,
                seller_id: item.owner_id,
                message: data.message,
                status: "pending"
            })
            .select()
            .single();

        if (error) throw error;
        return { data: sale, success: true };
    },

    updateStatus: async (id: string, status: string, delivery_info?: string) => {
        const updateData: any = { status };
        if (delivery_info) updateData.delivery_info = delivery_info;

        const { data, error } = await supabase
            .from("sales")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return { data, success: true };
    },
};

// ─── Troc Service ────────────────────────────────────

export const trocService = {
    getMyProposals: async (params?: Record<string, string>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        let query = supabase
            .from("troc_proposals")
            .select("*, requested_item:items(*), offered_item:items(*), proposer:profiles(*), owner:profiles(*)")
            .or(`proposer_id.eq.${user.id},owner_id.eq.${user.id}`);

        if (params?.status) query = query.eq("status", params.status);

        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) throw error;
        return { data, success: true };
    },

    create: async (data: {
        requested_item_id: string;
        offered_item_id?: string;
        offered_item_data?: any;
        message?: string;
        cash_complement?: number;
        complement_payer?: 'proposer' | 'owner';
    }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        const { data: item } = await supabase.from("items").select("owner_id").eq("id", data.requested_item_id).single();
        if (!item) throw new Error("Objet introuvable");

        const { data: troc, error } = await supabase
            .from("troc_proposals")
            .insert({
                ...data,
                proposer_id: user.id,
                owner_id: item.owner_id,
                status: "pending"
            })
            .select()
            .single();

        if (error) throw error;
        return { data: troc, success: true };
    },

    updateStatus: async (id: string, status: string) => {
        const { data, error } = await supabase
            .from("troc_proposals")
            .update({ status })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return { data, success: true };
    },
};

// ─── Favorites Service ───────────────────────────────

export const favoritesService = {
    checkFavorite: async (item_id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { isFavorite: false };

        const { data, error } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("item_id", item_id)
            .single();

        if (error && error.code !== "PGRST116") {
            // Log real errors except not found
            console.error("Error checking favorite status", error);
        }

        return { isFavorite: !!data };
    },

    toggleFavorite: async (item_id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Vous devez être connecté pour ajouter aux favoris.");

        // Check if exists
        const { data: existing } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("item_id", item_id)
            .single();

        if (existing) {
            // Remove favorite
            await supabase.from("favorites").delete().eq("id", existing.id);
            // Decrement item favorite_count (using direct RPC is better but let's do simple read-update for now or trigger handles it)
            // Karrily has a trigger in migrations handles favorite_count sync, so we just return state.
            return { isFavorite: false, success: true };
        } else {
            // Add favorite
            await supabase.from("favorites").insert({ user_id: user.id, item_id });
            return { isFavorite: true, success: true };
        }
    }
};


