import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// On peut laisser l'accès libre ou authentifié. 
// Pour un assistant de plateforme, l'authentification est préférable pour le suivi, 
// mais on peut le rendre public pour aider les nouveaux venus.
// Ici, on le met en optionnel ou public.
router.post("/chat", aiController.chat);

export { router as aiRoutes };
