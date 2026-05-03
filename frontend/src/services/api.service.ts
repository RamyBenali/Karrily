import { supabase } from "../lib/supabase";
import { api } from "../lib/api";
import { toast } from "sonner";

const handleSupabaseError = (error: any, defaultMsg: string) => {
    if (error) {
        console.error(error);
        toast.error(error.message || defaultMsg);
        throw error;
    }
};

// ─── Items Service ───────────────────────────────────

export const itemsService = {
    getAll: async (params?: Record<string, any>) => {
        const queryParams = new URLSearchParams();
        if (params?.category_id) queryParams.append("category", params.category_id);
        if (params?.status) queryParams.append("status", params.status);
        if (params?.is_available !== undefined) queryParams.append("is_available", String(params.is_available));
        if (params?.q) queryParams.append("search", params.q);
        if (params?.minPrice) queryParams.append("minPrice", String(params.minPrice));
        if (params?.maxPrice) queryParams.append("maxPrice", String(params.maxPrice));
        if (params?.location) queryParams.append("location", params.location);
        if (params?.condition) queryParams.append("condition", params.condition);
        if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));
        if (params?.type) queryParams.append("type", params.type);

        const response = await api.get(`/items?${queryParams.toString()}`);
        return { 
            data: response.data.data, 
            success: true, 
            count: response.data.pagination?.total || response.data.data.length 
        };
    },

    getFeatured: async () => {
        const response = await api.get('/items/featured');
        return { data: response.data.data, success: true };
    },

    search: async (q: string) => {
        const response = await api.get(`/items/search?q=${encodeURIComponent(q)}`);
        return { data: response.data.data, success: true };
    },

    getById: async (id: string) => {
        const response = await api.get(`/items/${id}`);
        return { data: response.data.data, success: true };
    },

    create: async (itemData: Record<string, any>) => {
        const response = await api.post('/items', itemData);
        return { data: response.data.data, success: true };
    },

    update: async (id: string, itemData: Record<string, any>) => {
        const response = await api.put(`/items/${id}`, itemData);
        return { data: response.data.data, success: true };
    },

    delete: async (id: string) => {
        const response = await api.delete(`/items/${id}`);
        return { success: true };
    },
};

// ─── Bookings Service ────────────────────────────────

export const bookingsService = {
    getMyBookings: async (params?: Record<string, string>) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.role) queryParams.append("role", params.role);
        
        const response = await api.get(`/bookings?${queryParams.toString()}`);
        return { data: response.data.data, success: true };
    },

    getById: async (id: string) => {
        const response = await api.get(`/bookings/${id}`);
        return { data: response.data.data, success: true };
    },

    create: async (data: { item_id: string; start_date: string; end_date: string; message?: string }) => {
        const response = await api.post('/bookings', data);
        return { data: response.data.data, success: true };
    },

    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/bookings/${id}/status`, { status });
        return { data: response.data.data, success: true };
    },

    cancel: async (id: string) => {
        const response = await api.delete(`/bookings/${id}`);
        return { success: true };
    },
};

// ─── Categories Service ──────────────────────────────

export const categoriesService = {
    getAll: async () => {
        const response = await api.get('/categories');
        return { data: response.data.data, success: true };
    },

    getBySlug: async (slug: string) => {
        const response = await api.get(`/categories/${slug}`);
        return { data: response.data.data, success: true };
    },
};

// ─── Users Service ───────────────────────────────────

export const usersService = {
    getProfile: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return { data: response.data.data, success: true };
    },

    updateProfile: async (data: Record<string, any>) => {
        const response = await api.put('/users/me', data);
        return { data: response.data.data, success: true };
    },

    getUserItems: async (userId: string) => {
        const response = await api.get(`/users/${userId}/items`);
        return { data: response.data.data, success: true };
    },

    getUserReviews: async (userId: string) => {
        const response = await api.get(`/users/${userId}/reviews`);
        return { data: response.data.data, success: true };
    },

    updateRole: async (userId: string, role: string) => {
        const response = await api.put(`/users/${userId}/role`, { role });
        return { data: response.data.data, success: true };
    },

    delete: async (userId: string) => {
        const response = await api.delete(`/users/${userId}`);
        return { success: true };
    },
};

// ─── Sales Service ───────────────────────────────────

export const salesService = {
    getMySales: async (params?: Record<string, string>) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.role) queryParams.append("role", params.role);
        
        const response = await api.get(`/sales?${queryParams.toString()}`);
        return { data: response.data.data, success: true };
    },

    create: async (data: { item_id: string; message?: string }) => {
        const response = await api.post('/sales', data);
        return { data: response.data.data, success: true };
    },

    updateStatus: async (id: string, status: string, delivery_info?: string) => {
        const response = await api.patch(`/sales/${id}/status`, { status, delivery_info });
        return { data: response.data.data, success: true };
    },
};

// ─── Troc Service ────────────────────────────────────

export const trocService = {
    getMyProposals: async (params?: Record<string, string>) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.role) queryParams.append("role", params.role);
        
        const response = await api.get(`/troc?${queryParams.toString()}`);
        return { data: response.data.data, success: true };
    },

    create: async (data: {
        requested_item_id: string;
        offered_item_id?: string;
        offered_item_data?: any;
        message?: string;
        cash_complement?: number;
        complement_payer?: 'proposer' | 'owner';
    }) => {
        const response = await api.post('/troc', data);
        return { data: response.data.data, success: true };
    },

    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/troc/${id}/status`, { status });
        return { data: response.data.data, success: true };
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
            console.error("Error checking favorite status", error);
        }

        return { isFavorite: !!data };
    },

    toggleFavorite: async (item_id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Vous devez être connecté pour ajouter aux favoris.");

        const { data: existing } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("item_id", item_id)
            .single();

        if (existing) {
            await supabase.from("favorites").delete().eq("id", existing.id);
            return { isFavorite: false, success: true };
        } else {
            await supabase.from("favorites").insert({ user_id: user.id, item_id });
            return { isFavorite: true, success: true };
        }
    },

    getMyFavorites: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        const { data, error } = await supabase
            .from("favorites")
            .select("*, item:items(*, category:categories(*))")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
            
        handleSupabaseError(error, "Erreur lors de la récupération des favoris.");
        return { data, success: true };
    }
};

// ─── Reviews Service ─────────────────────────────────

export const reviewsService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from("reviews")
            .select("*, item:items(title), reviewer:profiles!reviewer_id(full_name, avatar_url)")
            .order("created_at", { ascending: false });
        handleSupabaseError(error, "Erreur lors de la récupération des avis.");
        return { data, success: true };
    },

    getByItem: async (itemId: string) => {
        const { data, error } = await supabase
            .from("reviews")
            .select("*, reviewer:profiles!reviewer_id(full_name, avatar_url)")
            .eq("item_id", itemId)
            .order("created_at", { ascending: false });
        handleSupabaseError(error, "Erreur lors de la récupération des avis de l'article.");
        return { data, success: true };
    },

    getByLender: async (lenderId: string) => {
        const { data, error } = await supabase
            .from("reviews")
            .select("*, item:items(title, owner_id), reviewer:profiles!reviewer_id(full_name, avatar_url)")
            .eq("reviewed_user_id", lenderId)
            .order("created_at", { ascending: false });
        
        handleSupabaseError(error, "Erreur lors de la récupération des avis du vendeur.");
        return { data, success: true };
    },

    create: async (data: { item_id: string; reviewed_user_id?: string; booking_id?: string; rating: number; comment: string }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        const { data: review, error } = await supabase
            .from("reviews")
            .insert({
                item_id: data.item_id,
                reviewer_id: user.id,
                reviewed_user_id: data.reviewed_user_id,
                rating: data.rating,
                comment: data.comment,
                booking_id: data.booking_id // Added if schema supports it
            })
            .select()
            .single();
            
        handleSupabaseError(error, "Erreur lors de la création de l'avis.");
        return { data: review, success: true };
    },

    delete: async (id: string) => {
        const response = await api.delete(`/reviews/${id}`);
        return { success: true, data: response.data };
    },

    dismissReport: async (id: string) => {
        const response = await api.patch(`/reviews/${id}/dismiss-report`);
        return { success: true, data: response.data };
    }
};

// ─── Reports Service ─────────────────────────────────

export const reportsService = {
    create: async (data: { 
        reported_item_id?: string; 
        reported_user_id?: string; 
        reported_review_id?: string; 
        reason: string; 
        description?: string 
    }) => {
        const response = await api.post('/reports', data);
        return { data: response.data.data, success: true };
    },

    getAll: async () => {
        const response = await api.get('/reports');
        return { data: response.data.data, success: true };
    },

    updateStatus: async (id: string, status: string, admin_notes?: string) => {
        const response = await api.patch(`/reports/${id}/status`, { status, admin_notes });
        return { data: response.data.data, success: true };
    },

    delete: async (id: string) => {
        const response = await api.delete(`/reports/${id}`);
        return { success: true };
    }
};

// ─── Stats Service ───────────────────────────────────

export const statsService = {
    getLenderStats: async () => {
        const response = await api.get('/stats/lender');
        return { data: response.data.data, success: true };
    },

    getAdminStats: async () => {
        const response = await api.get('/stats/admin');
        return { data: response.data.data, success: true };
    },

    getGlobalStats: async () => {
        const response = await api.get('/stats/global');
        return { data: response.data.data, success: true };
    }
};
