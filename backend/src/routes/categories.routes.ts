import { Router } from "express";
import { CategoriesController } from "../controllers/categories.controller.js";

export const categoriesRoutes = Router();
const controller = new CategoriesController();

// GET /api/categories — List all categories
categoriesRoutes.get("/", controller.getAll);

// GET /api/categories/:slug — Get category with items
categoriesRoutes.get("/:slug", controller.getBySlug);
