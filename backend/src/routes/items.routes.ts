import { Router } from "express";
import { ItemsController } from "../controllers/items.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const itemsRoutes = Router();
const controller = new ItemsController();

// GET /api/items — List items (with filters & pagination)
itemsRoutes.get("/", controller.getAll);

// GET /api/items/featured — Get featured/premium items
itemsRoutes.get("/featured", controller.getFeatured);

// GET /api/items/search — Search items
itemsRoutes.get("/search", controller.search);

// GET /api/items/:id — Get single item detail
itemsRoutes.get("/:id", controller.getById);

// POST /api/items — Create new listing (auth required)
itemsRoutes.post("/", authMiddleware, controller.create);

// PUT /api/items/:id — Update listing (auth required)
itemsRoutes.put("/:id", authMiddleware, controller.update);

// DELETE /api/items/:id — Delete listing (auth required)
itemsRoutes.delete("/:id", authMiddleware, controller.delete);
