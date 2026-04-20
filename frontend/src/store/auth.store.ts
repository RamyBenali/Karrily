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
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            let currentRole = "user";
            let currentHasItems = false;
            
            if (session?.user) {
                const [profileReq, itemsReq] = await Promise.all([
                   supabase.from("profiles").select("role").eq("id", session.user.id).single(),
                   supabase.from("items").select("id", { count: "exact", head: true }).eq("owner_id", session.user.id)
                ]);
                
                if (profileReq.data) currentRole = profileReq.data.role;
                if (itemsReq.count && itemsReq.count > 0) currentHasItems = true;
            }

            set({
                user: session?.user ?? null,
                session,
                isAuthenticated: !!session,
                isLoading: false,
                role: currentRole,
                hasItems: currentHasItems
            });

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (_event, newSession) => {
                let r = "user";
                let h = false;
                
                if (newSession?.user) {
                   const [profileReq, itemsReq] = await Promise.all([
                      supabase.from("profiles").select("role").eq("id", newSession.user.id).single(),
                      supabase.from("items").select("id", { count: "exact", head: true }).eq("owner_id", newSession.user.id)
                   ]);
                   if (profileReq.data) r = profileReq.data.role;
                   if (itemsReq.count && itemsReq.count > 0) h = true;
                }
                
                set({
                    user: newSession?.user ?? null,
                    session: newSession,
                    isAuthenticated: !!newSession,
                    role: r,
                    hasItems: h
                });
            });
        } catch {
            set({ isLoading: false });
        }
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
