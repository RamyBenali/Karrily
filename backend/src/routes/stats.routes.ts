import { Router } from "express";
import { StatsController } from "../controllers/stats.controller.js";
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

const statsRoutes = Router();
const controller = new StatsController();

// Public stats
statsRoutes.get("/global", controller.getGlobalStats);

// Lender stats (Requires authentication)
statsRoutes.get("/lender", authMiddleware, controller.getLenderStats);

// Admin stats (Requires admin role)
statsRoutes.get("/admin", authMiddleware, authorizeRoles("admin"), controller.getAdminStats);

export { statsRoutes };
