import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { apiRouter } from "./routes/index.js";

const app = express();

// ─── Security ────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────
app.use(
    cors({
        origin: config.cors.frontendUrl,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ─── Body Parsing ────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────
if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// ─── Health Check ────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// ─── API Routes ──────────────────────────────────────
app.use("/api", apiRouter);

// ─── Error Handling ──────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────
app.listen(config.port, () => {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║        🚀 Karrily API Server                  ║
  ║        Port: ${String(config.port).padEnd(31)}║
  ║        Env:  ${config.nodeEnv.padEnd(31)}║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
