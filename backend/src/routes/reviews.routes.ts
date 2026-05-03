import { Router } from "express";
import { ReviewsController } from "../controllers/reviews.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new ReviewsController();

// All review moderation routes require authentication
router.use(authMiddleware);

// DELETE /api/reviews/:id - Delete a review
router.delete("/:id", controller.delete);

// PATCH /api/reviews/:id/dismiss-report - Dismiss report (Admin only)
router.patch("/:id/dismiss-report", controller.dismissReport);

export { router as reviewsRoutes };
