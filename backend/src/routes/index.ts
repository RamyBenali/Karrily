import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { itemsRoutes } from "./items.routes.js";
import { bookingsRoutes } from "./bookings.routes.js";
import { salesRoutes } from "./sales.routes.js";
import { trocRoutes } from "./troc.routes.js";
import { usersRoutes } from "./users.routes.js";
import { categoriesRoutes } from "./categories.routes.js";
import { statsRoutes } from "./stats.routes.js";
import { reportsRoutes } from "./reports.routes.js";

export const apiRouter = Router();

// ─── Mount route modules ────────────────────────────
apiRouter.use("/auth", authRoutes);
apiRouter.use("/items", itemsRoutes);
apiRouter.use("/bookings", bookingsRoutes);
apiRouter.use("/sales", salesRoutes);
apiRouter.use("/troc", trocRoutes);
apiRouter.use("/users", usersRoutes);
apiRouter.use("/categories", categoriesRoutes);
apiRouter.use("/stats", statsRoutes);
apiRouter.use("/reports", reportsRoutes);
