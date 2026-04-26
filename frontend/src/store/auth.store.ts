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

        // Safety timeout: Ensure loading state is ALWAYS cleared after 5 seconds
        const timeoutId = setTimeout(() => {
            const state = get();
            if (state.isLoading) {
                console.warn("Auth initialization safety trigger: Forcing loading to false.");
                set({ isLoading: false });
            }
        }, 5000);

        try {
            // 1. Setup Auth State Listener
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_OUT' || !session) {
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

                // Update session/user immediately
                set({ 
                    user: session.user, 
                    session, 
                    isAuthenticated: true,
                    isLoading: false // UI can show "Logged in" state now
                });

                // Fetch roles/metadata in background without blocking
                get().fetchUserMetadata(session.user.id).then(({ role, hasItems }) => {
                    set({ role, hasItems });
                });
            });

            // 2. Initial Session Check (with slight retry for network stability)
            const getSessionWithRetry = async (retries = 2) => {
                for (let i = 0; i < retries; i++) {
                    const { data, error } = await supabase.auth.getSession();
                    if (!error) return data.session;
                    if (i < retries - 1) await new Promise(r => setTimeout(r, 500));
                }
                return null;
            };

            const session = await getSessionWithRetry();
            
            if (session?.user) {
                // Set authenticated state immediately
                set({
                    user: session.user,
                    session,
                    isAuthenticated: true
                });

                // Fetch metadata in background
                const { role, hasItems } = await get().fetchUserMetadata(session.user.id);
                set({ role, hasItems, isLoading: false });
            } else {
                set({ user: null, session: null, isAuthenticated: false, role: "user", hasItems: false, isLoading: false });
            }

        } catch (error) {
            console.error("Critical Auth initialization error:", error);
            set({ isLoading: false });
        } finally {
            clearTimeout(timeoutId);
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
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role: "user" },
            },
        });
        if (error) {
            console.error("Supabase Signup Error:", error);
            throw error;
        }

        if (data.user) {
            // Initialize basic state for the new user
            set({
                user: data.user,
                session: data.session,
                isAuthenticated: !!data.session,
                role: "user",
                hasItems: false,
                isLoading: false
            });
        }
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) {
            console.error("Supabase Login Error:", error);
            throw error;
        }

        if (data.user) {
            // Force immediate metadata fetch to avoid redirect race conditions
            const { role, hasItems } = await get().fetchUserMetadata(data.user.id);
            set({
                user: data.user,
                session: data.session,
                isAuthenticated: true,
                role,
                hasItems,
                isLoading: false
            });
        }
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
