import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

export const authRoutes = Router();
const controller = new AuthController();

// POST /api/auth/signup
authRoutes.post("/signup", controller.signup);

// POST /api/auth/login
authRoutes.post("/login", controller.login);

// POST /api/auth/logout
authRoutes.post("/logout", controller.logout);

// GET /api/auth/me — Get current user profile
authRoutes.get("/me", controller.getMe);
