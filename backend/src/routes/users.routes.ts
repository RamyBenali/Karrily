import { Router } from "express";
import { UsersController } from "../controllers/users.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const usersRoutes = Router();
const controller = new UsersController();

// GET /api/users/:id — Get public user profile
usersRoutes.get("/:id", controller.getProfile);

// PUT /api/users/me — Update own profile (auth required)
usersRoutes.put("/me", authMiddleware, controller.updateProfile);

// GET /api/users/:id/items — Get items listed by a user
usersRoutes.get("/:id/items", controller.getUserItems);

// GET /api/users/:id/reviews — Get reviews for a user
usersRoutes.get("/:id/reviews", controller.getUserReviews);

// PUT /api/users/:id/role — Update user role (admin only)
usersRoutes.put("/:id/role", authMiddleware, controller.updateRole);

// DELETE /api/users/:id — Delete user (admin only)
usersRoutes.delete("/:id", authMiddleware, controller.deleteUser);
