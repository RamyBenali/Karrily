import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { apiRouter } from "./routes/index.js";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            if (config.nodeEnv === "development") {
                const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
                if (isLocalhost) return callback(null, true);
            }

            const allowed = process.env.FRONTEND_URL
                ? process.env.FRONTEND_URL.split(",")
                : [...config.cors.allowedOrigins];

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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.port, () => {
    console.log(`Karrily API — port ${config.port} [${config.nodeEnv}]`);
});

server.on('error', (err: Error & { code?: string }) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${config.port} is already in use.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});

export default app;
