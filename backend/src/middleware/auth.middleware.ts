import { Request, Response, NextFunction } from "express";
import { createUserClient } from "../config/supabase.js";
import { ApiError } from "./error.middleware.js";

// Extend Express Request to include the authenticated user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                full_name: string;
                role?: string;
            };
            supabaseClient?: ReturnType<typeof createUserClient>;
        }
    }
}

/**
 * Authentication middleware
 * Validates the JWT from Supabase and attaches user info to the request
 */
export async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Unauthorized: No valid token provided");
        }

        const token = authHeader.split(" ")[1];

        // Create a user-scoped Supabase client
        const userClient = createUserClient(token);

        // Verify the token by fetching the user
        const {
            data: { user },
            error,
        } = await userClient.auth.getUser(token);

        if (error || !user) {
            throw new ApiError(401, "Unauthorized: Invalid or expired token");
        }

        // Attach user info and client to request
        req.user = {
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || "Utilisateur",
            role: user.user_metadata?.role || "user",
        };
        req.supabaseClient = userClient;

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(401, "Unauthorized"));
        }
    }
}

/**
 * Role-based authorization middleware
 * Must be used AFTER authMiddleware
 */
export function authorizeRoles(...roles: string[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        if (!roles.includes(req.user.role || "user")) {
            return next(
                new ApiError(403, "Forbidden: Insufficient permissions")
            );
        }

        next();
    };
}
