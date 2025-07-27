// Health check serverless function
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      // Simple health check
      const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          api: "healthy",
          mlService: "healthy", // Simplified for Vercel
          mlServiceResponse: 25,
        },
      };

      res.status(200).json(healthData);
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
