import { Router } from "express";
import { ReportsController } from "../controllers/reports.controller.js";
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

export const reportsRoutes = Router();
const controller = new ReportsController();

// POST /api/reports — Create a report (Authenticated)
reportsRoutes.post("/", authMiddleware, controller.create);

// GET /api/reports — Get all reports (Admin only)
reportsRoutes.get("/", authMiddleware, authorizeRoles("admin"), controller.getAll);

// PATCH /api/reports/:id/status — Update report status (Admin only)
reportsRoutes.patch("/:id/status", authMiddleware, authorizeRoles("admin"), controller.updateStatus);

// DELETE /api/reports/:id — Delete a report (Admin only)
reportsRoutes.delete("/:id", authMiddleware, authorizeRoles("admin"), controller.delete);
