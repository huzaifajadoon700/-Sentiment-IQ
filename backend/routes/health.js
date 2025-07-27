/**
 * Health check routes
 */

const express = require("express");
const sentimentService = require("../services/sentimentService");

const router = express.Router();

/**
 * GET /health
 * Basic health check
 */
router.get("/", async (req, res) => {
  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: "1.0.0",
      services: {
        api: "healthy",
      },
    };

    // Check ML service health
    try {
      const mlHealth = await sentimentService.checkMLServiceHealth();
      healthData.services.mlService = mlHealth.status;
      healthData.services.mlServiceResponse = mlHealth.responseTime;
    } catch (error) {
      healthData.services.mlService = "unhealthy";
      healthData.services.mlServiceError = error.message;
    }

    // Determine overall status
    const serviceStatuses = [
      healthData.services.api,
      healthData.services.mlService,
    ];
    const allServicesHealthy = serviceStatuses.every(
      (status) => status === "healthy"
    );

    if (!allServicesHealthy) {
      healthData.status = "degraded";
    }

    const statusCode = healthData.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    console.error("❌ Health check error:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * GET /health/detailed
 * Detailed health check with system information
 */
router.get("/detailed", async (req, res) => {
  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: "1.0.0",
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
        cpu: {
          usage: process.cpuUsage(),
        },
      },
      services: {
        api: "healthy",
      },
    };

    // Check ML service health with detailed info
    try {
      const mlHealth = await sentimentService.checkMLServiceHealth(true);
      healthData.services.mlService = {
        status: mlHealth.status,
        responseTime: mlHealth.responseTime,
        version: mlHealth.version,
        modelsLoaded: mlHealth.modelsLoaded,
      };
    } catch (error) {
      healthData.services.mlService = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // Determine overall status
    const servicesHealthy = healthData.services.mlService.status === "healthy";

    if (!servicesHealthy) {
      healthData.status = "degraded";
    }

    const statusCode = healthData.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    console.error("❌ Detailed health check error:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * GET /health/ready
 * Readiness probe for container orchestration
 */
router.get("/ready", async (req, res) => {
  try {
    // Check if all required services are ready
    const mlServiceReady = await sentimentService.checkMLServiceHealth();

    if (mlServiceReady.status === "healthy") {
      res.status(200).json({
        status: "ready",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: "not ready",
        reason: "ML service not available",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("❌ Readiness check error:", error);
    res.status(503).json({
      status: "not ready",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/live
 * Liveness probe for container orchestration
 */
router.get("/live", (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
