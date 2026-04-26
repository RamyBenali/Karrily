import axios from "axios";
import { supabase } from "./supabase";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Axios instance configured for the Karrily API
 * Automatically includes the Supabase JWT token in requests
 */
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
    async (config) => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle 401 — redirect to login
        if (error.response?.status === 401) {
            await supabase.auth.signOut();
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);
