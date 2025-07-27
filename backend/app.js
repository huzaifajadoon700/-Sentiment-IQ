/**
 * Express application setup and configuration
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Import routes
const sentimentRoutes = require("./routes/sentiment");
const healthRoutes = require("./routes/health");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Logging middleware
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint (before rate limiting)
app.use("/health", healthRoutes);

// API routes
app.use("/api/sentiment", sentimentRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🎭 Sentiment Analysis API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      analyze: "/api/sentiment/analyze",
    },
    documentation: "https://github.com/your-repo/sentiment-web-app",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: ["GET /", "GET /health", "POST /api/sentiment/analyze"],
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
