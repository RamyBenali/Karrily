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
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    impersonatedUserId: null,
    impersonatedUser: null,

    initialize: async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            set({
                user: session?.user ?? null,
                session,
                isAuthenticated: !!session,
                isLoading: false,
            });

            // Listen for auth changes
            supabase.auth.onAuthStateChange((_event, session) => {
                set({
                    user: session?.user ?? null,
                    session,
                    isAuthenticated: !!session,
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
        set({ user: null, session: null, isAuthenticated: false });
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
