import { Request, Response, NextFunction } from "express";

/**
 * Custom API error class with HTTP status code
 */
export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: Error | ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";

    // Log the error in development
    if (process.env.NODE_ENV === "development") {
        console.error(" Error:", {
            statusCode,
            message,
            stack: err.stack,
        });
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        },
    });
}
