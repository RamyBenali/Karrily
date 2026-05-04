import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || "3001", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    supabase: {
        url: process.env.SUPABASE_URL || "",
        anonKey: process.env.SUPABASE_ANON_KEY || "",
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    },
    cors: {
        allowedOrigins: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181"],
    },
    jwt: {
        secret: process.env.JWT_SECRET || "fallback-secret-change-me",
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || "",
    },
    deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY || "",
    },
} as const;
