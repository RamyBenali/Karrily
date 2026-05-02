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
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);

            if (config.nodeEnv === "development") {
                // Allow any localhost/127.0.0.1 origins in development
                const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
                if (isLocalhost) {
                    return callback(null, true);
                }
            }
            
            const allowed = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : [...config.cors.allowedOrigins];
            
            // Normalize origin and allowed origins (remove trailing slashes) for comparison
            const normalizedOrigin = origin.replace(/\/$/, "");
            const isAllowed = allowed.some(a => a.replace(/\/$/, "") === normalizedOrigin);

            if (isAllowed) {
                callback(null, true);
            } else {
                console.error(`CORS rejected origin: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            }
        },
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
const server = app.listen(config.port, () => {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║         Karrily API Server                  ║
  ║        Port: ${String(config.port).padEnd(31)}║
  ║        Env:  ${config.nodeEnv.padEnd(31)}║
  ╚═══════════════════════════════════════════════╝
  `);
});

server.on('error', (err: Error & { code?: string }) => {
    if (err.code === 'EADDRINUSE') {
        console.error(` Port ${config.port} is already in use. Attempting to recover...`);
        // The process will likely be restarted by tsx watch anyway, 
        // but this prevents the "Unhandled 'error' event" crash.
        process.exit(1);
    } else {
        console.error(' Server error:', err);
    }
});

export default app;
