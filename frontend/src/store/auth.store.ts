import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface ImpersonatedUser {
    id: string;
    full_name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    impersonatedUserId: string | null;
    impersonatedUser: ImpersonatedUser | null;
    role: string;
    hasItems: boolean;

    // Actions
    initialize: () => Promise<void>;
    signUp: (email: string, password: string, fullName: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setImpersonation: (userId: string, userDetails: ImpersonatedUser) => void;
    clearImpersonation: () => void;
    getEffectiveUser: () => { id: string; email?: string } | null;
    getDashboardPath: () => string;
    fetchUserMetadata: (userId: string) => Promise<{ role: string; hasItems: boolean }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    impersonatedUserId: null,
    impersonatedUser: null,
    role: "user",
    hasItems: false,

    initialize: async () => {
        set({ isLoading: true });
        try {
            // 1. Initial listener setup (for future changes)
            supabase.auth.onAuthStateChange(async (_event, newSession) => {
                if (_event === 'SIGNED_OUT') {
                    set({ 
                        user: null, 
                        session: null, 
                        isAuthenticated: false, 
                        role: "user", 
                        hasItems: false,
                        isLoading: false
                    });
                    return;
                }
                
                if (newSession?.user) {
                    const { role, hasItems } = await get().fetchUserMetadata(newSession.user.id);
                    set({
                        user: newSession.user,
                        session: newSession,
                        isAuthenticated: true,
                        role,
                        hasItems,
                        isLoading: false
                    });
                }
            });

            // 2. Explicitly get initial session (for persistence)
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                const { role, hasItems } = await get().fetchUserMetadata(session.user.id);
                set({
                    user: session.user,
                    session: session,
                    isAuthenticated: true,
                    role,
                    hasItems,
                    isLoading: false
                });
            } else {
                // If no session, set loading to false but keep user null (Anonymous mode)
                set({ user: null, session: null, isAuthenticated: false, role: "user", hasItems: false, isLoading: false });
            }

        } catch (error) {
            console.error("Auth initialization error:", error);
            set({ isLoading: false });
        }
    },

    fetchUserMetadata: async (userId: string) => {
        let r = "user";
        let h = false;
        try {
            const [profileReq, itemsReq] = await Promise.all([
                supabase.from("profiles").select("role").eq("id", userId).single(),
                supabase.from("items").select("id", { count: "exact", head: true }).eq("owner_id", userId)
            ]);
            if (profileReq.data) r = profileReq.data.role;
            if (itemsReq.count && itemsReq.count > 0) h = true;
        } catch (e) {
            console.error("Error fetching user metadata:", e);
        }
        return { role: r, hasItems: h };
    },

    signUp: async (email, password, fullName) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role: "user" },
            },
        });
        if (error) throw error;
    },

    signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ user: null, session: null, isAuthenticated: false, role: "user", hasItems: false });
    },

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setSession: (session) => set({ session }),

    setImpersonation: (userId, userDetails) => set({
        impersonatedUserId: userId,
        impersonatedUser: userDetails
    }),

    clearImpersonation: () => set({
        impersonatedUserId: null,
        impersonatedUser: null
    }),

    getDashboardPath: () => {
        const state = get();
        if (state.role === "admin") return "/admin";
        if (state.role === "lender" || state.role === "vendeur" || state.hasItems) return "/lender";
        return "/dashboard";
    },

    getEffectiveUser: () => {
        const state = get();
        if (state.impersonatedUserId && state.impersonatedUser) {
            return {
                ...state.impersonatedUser
            };
        }
        return state.user ? { id: state.user.id, email: state.user.email } : null;
    },
}));
