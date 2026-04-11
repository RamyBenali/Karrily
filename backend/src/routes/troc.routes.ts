import { Router } from "express";
import { TrocController } from "../controllers/troc.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const trocRoutes = Router();
const controller = new TrocController();

trocRoutes.use(authMiddleware);

trocRoutes.get("/", controller.getMyProposals);
trocRoutes.post("/", controller.create);
trocRoutes.patch("/:id/status", controller.updateStatus);
