import { api } from "../lib/api";

// ─── Items Service ───────────────────────────────────

export const itemsService = {
    getAll: (params?: Record<string, string | number>) =>
        api.get("/items", { params }).then((res) => res.data),

    getFeatured: () =>
        api.get("/items/featured").then((res) => res.data),

    search: (query: string) =>
        api.get("/items/search", { params: { q: query } }).then((res) => res.data),

    getById: (id: string) =>
        api.get(`/items/${id}`).then((res) => res.data),

    create: (data: Record<string, unknown>) =>
        api.post("/items", data).then((res) => res.data),

    update: (id: string, data: Record<string, unknown>) =>
        api.put(`/items/${id}`, data).then((res) => res.data),

    delete: (id: string) =>
        api.delete(`/items/${id}`).then((res) => res.data),
};

// ─── Bookings Service ────────────────────────────────

export const bookingsService = {
    getMyBookings: (params?: Record<string, string>) =>
        api.get("/bookings", { params }).then((res) => res.data),

    getById: (id: string) =>
        api.get(`/bookings/${id}`).then((res) => res.data),

    create: (data: { item_id: string; start_date: string; end_date: string; message?: string }) =>
        api.post("/bookings", data).then((res) => res.data),

    updateStatus: (id: string, status: string) =>
        api.patch(`/bookings/${id}/status`, { status }).then((res) => res.data),

    cancel: (id: string) =>
        api.delete(`/bookings/${id}`).then((res) => res.data),
};

// ─── Categories Service ──────────────────────────────

export const categoriesService = {
    getAll: () =>
        api.get("/categories").then((res) => res.data),

    getBySlug: (slug: string) =>
        api.get(`/categories/${slug}`).then((res) => res.data),
};

// ─── Users Service ───────────────────────────────────

export const usersService = {
    getProfile: (id: string) =>
        api.get(`/users/${id}`).then((res) => res.data),

    updateProfile: (data: Record<string, unknown>) =>
        api.put("/users/me", data).then((res) => res.data),

    getUserItems: (id: string) =>
        api.get(`/users/${id}/items`).then((res) => res.data),

    getUserReviews: (id: string) =>
        api.get(`/users/${id}/reviews`).then((res) => res.data),
};
