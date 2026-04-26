// ─── Frontend Types for Karrily ──────────────────────
// Mirror of backend types for type safety across the stack

// ─── User ────────────────────────────────────────────
export interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
    role: "user" | "lender" | "admin";
    bio?: string;
    location?: string;
    rating?: number;
    total_reviews?: number;
    created_at: string;
    updated_at: string;
}

// ─── Category ────────────────────────────────────────
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    image_url?: string;
    item_count?: number;
    created_at: string;
}

// ─── Item ────────────────────────────────────────────
export interface Item {
    id: string;
    title: string;
    description: string;
    price_per_day: number;
    price_per_week?: number;
    price_per_month?: number;
    category_id: string;
    category?: Category;
    owner_id: string;
    owner?: User;
    location: string;
    latitude?: number;
    longitude?: number;
    images: string[];
    condition: "new" | "like_new" | "good" | "fair";
    is_available: boolean;
    is_premium: boolean;
    rating?: number;
    total_reviews?: number;
    total_bookings?: number;
    tags?: string[];
    created_at: string;
    updated_at: string;
}

// ─── Booking ─────────────────────────────────────────
export interface Booking {
    id: string;
    item_id: string;
    item?: Item;
    renter_id: string;
    renter?: User;
    owner_id: string;
    owner?: User;
    start_date: string;
    end_date: string;
    total_price: number;
    status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
    payment_status: "pending" | "paid" | "refunded";
    message?: string;
    created_at: string;
    updated_at: string;
}

// ─── Review ──────────────────────────────────────────
export interface Review {
    id: string;
    item_id: string;
    reviewer_id: string;
    reviewer?: User;
    rating: number;
    comment: string;
    created_at: string;
}

// ─── API Response ────────────────────────────────────
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
    };
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
