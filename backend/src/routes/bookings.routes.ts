import { Router } from "express";
import { BookingsController } from "../controllers/bookings.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const bookingsRoutes = Router();
const controller = new BookingsController();

// All booking routes require authentication
bookingsRoutes.use(authMiddleware);

// GET /api/bookings — Get user's bookings
bookingsRoutes.get("/", controller.getMyBookings);

// GET /api/bookings/:id — Get booking details
bookingsRoutes.get("/:id", controller.getById);

// POST /api/bookings — Create a new booking
bookingsRoutes.post("/", controller.create);

// PATCH /api/bookings/:id/status — Update booking status
bookingsRoutes.patch("/:id/status", controller.updateStatus);

// DELETE /api/bookings/:id — Cancel a booking
bookingsRoutes.delete("/:id", controller.cancel);
