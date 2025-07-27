/**
 * Global error handling middleware
 */

const config = require('../utils/config');

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
    // Log error details
    console.error('❌ Error occurred:', {
        message: err.message,
        stack: config.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Default error response
    let error = {
        success: false,
        error: 'Internal Server Error',
        message: 'Something went wrong. Please try again.',
        timestamp: new Date().toISOString()
    };

    // Handle specific error types
    if (err.name === 'ValidationError') {
        error.error = 'Validation Error';
        error.message = err.message;
        error.statusCode = 400;
    } else if (err.name === 'CastError') {
        error.error = 'Invalid Data Format';
        error.message = 'Invalid data provided';
        error.statusCode = 400;
    } else if (err.code === 'ECONNREFUSED') {
        error.error = 'Service Unavailable';
        error.message = 'External service is not available. Please try again later.';
        error.statusCode = 503;
    } else if (err.code === 'ETIMEDOUT') {
        error.error = 'Request Timeout';
        error.message = 'Request timed out. Please try again.';
        error.statusCode = 408;
    } else if (err.message.includes('ML service')) {
        error.error = 'ML Service Error';
        error.message = err.message;
        error.statusCode = 503;
    } else if (err.statusCode) {
        error.statusCode = err.statusCode;
        error.error = err.name || 'Error';
        error.message = err.message;
    }

    // Set default status code if not set
    const statusCode = error.statusCode || 500;

    // Add error details in development mode
    if (config.NODE_ENV === 'development') {
        error.details = {
            stack: err.stack,
            originalError: err.message
        };
    }

    // Add request context for debugging
    if (config.NODE_ENV === 'development') {
        error.request = {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers,
            body: req.body,
            query: req.query,
            params: req.params
        };
    }

    // Send error response
    res.status(statusCode).json(error);
};

/**
 * 404 Not Found handler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'GET /',
            'GET /health',
            'POST /api/sentiment/analyze',
            'POST /api/sentiment/batch',
            'GET /api/sentiment/models',
            'GET /api/sentiment/stats'
        ]
    });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Custom error class for application errors
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    AppError
};
