import { Router } from "express";
import { SalesController } from "../controllers/sales.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const salesRoutes = Router();
const controller = new SalesController();

salesRoutes.use(authMiddleware);

salesRoutes.get("/", controller.getMySales);
salesRoutes.post("/", controller.create);
salesRoutes.patch("/:id/status", controller.updateStatus);
