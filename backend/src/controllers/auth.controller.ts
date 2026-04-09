import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";

export class AuthController {
    /**
     * POST /api/auth/signup
     */
    signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, full_name } = req.body;

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name, role: "user" },
                },
            });

            if (error) throw error;

            res.status(201).json({
                success: true,
                data: {
                    user: data.user,
                    session: data.session,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/auth/login
     */
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            res.json({
                success: true,
                data: {
                    user: data.user,
                    session: data.session,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/auth/logout
     */
    logout = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            res.json({ success: true, data: { message: "Logged out successfully" } });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/auth/me
     */
    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ success: false, error: { message: "No token provided" } });
            }

            const token = authHeader.split(" ")[1];
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                return res.status(401).json({ success: false, error: { message: "Invalid token" } });
            }

            res.json({ success: true, data: { user } });
        } catch (error) {
            next(error);
        }
    };
}
