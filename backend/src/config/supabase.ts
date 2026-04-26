import { createClient } from "@supabase/supabase-js";
import { config } from "./index.js";

// Admin client (uses service role key — full access, bypass RLS)
// Use this ONLY in backend services for admin operations
const sanitizedUrl = config.supabase.url.replace(/\/$/, "");

// Admin client (uses service role key — full access, bypass RLS)
// Use this ONLY in backend services for admin operations
export const supabaseAdmin = createClient(
    sanitizedUrl,
    config.supabase.serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Public client (uses anon key — respects RLS)
// Use this when making requests on behalf of a user
export const supabase = createClient(
    sanitizedUrl,
    config.supabase.anonKey
);

/**
 * Creates a Supabase client authenticated with a user's JWT token.
 * This ensures RLS policies are applied for the specific user.
 */
export function createUserClient(accessToken: string) {
    return createClient(config.supabase.url, config.supabase.anonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
}
