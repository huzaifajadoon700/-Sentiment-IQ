/**
 * Configuration management utility
 */

require('dotenv').config();

const config = {
    // Server configuration
    PORT: parseInt(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // ML Service configuration
    ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    ML_SERVICE_TIMEOUT: parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000,
    
    // CORS configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    
    // Rate limiting configuration
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    
    // Logging configuration
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Security configuration
    HELMET_ENABLED: process.env.HELMET_ENABLED !== 'false',
    
    // Request limits
    MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE || '10mb',
    MAX_BATCH_SIZE: parseInt(process.env.MAX_BATCH_SIZE) || 100,
    MAX_TEXT_LENGTH: parseInt(process.env.MAX_TEXT_LENGTH) || 5000,
    
    // Health check configuration
    HEALTH_CHECK_TIMEOUT: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
    
    // Development flags
    ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING !== 'false',
    ENABLE_ERROR_STACK: process.env.NODE_ENV === 'development'
};

/**
 * Validate required configuration
 */
const validateConfig = () => {
    const required = ['ML_SERVICE_URL'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
    
    // Validate URLs
    try {
        new URL(config.ML_SERVICE_URL);
    } catch (error) {
        throw new Error(`Invalid ML_SERVICE_URL: ${config.ML_SERVICE_URL}`);
    }
    
    // Validate numeric values
    if (config.PORT < 1 || config.PORT > 65535) {
        throw new Error(`Invalid PORT: ${config.PORT}`);
    }
    
    if (config.ML_SERVICE_TIMEOUT < 1000) {
        throw new Error(`ML_SERVICE_TIMEOUT too low: ${config.ML_SERVICE_TIMEOUT}ms`);
    }
};

/**
 * Get configuration for specific environment
 * @param {string} env - Environment name
 * @returns {object} Environment-specific configuration
 */
const getEnvConfig = (env = config.NODE_ENV) => {
    const envConfigs = {
        development: {
            ...config,
            ENABLE_REQUEST_LOGGING: true,
            ENABLE_ERROR_STACK: true,
            LOG_LEVEL: 'debug'
        },
        production: {
            ...config,
            ENABLE_REQUEST_LOGGING: false,
            ENABLE_ERROR_STACK: false,
            LOG_LEVEL: 'warn',
            RATE_LIMIT_MAX_REQUESTS: 50 // Stricter rate limiting in production
        },
        test: {
            ...config,
            PORT: 0, // Use random port for testing
            ENABLE_REQUEST_LOGGING: false,
            LOG_LEVEL: 'error',
            ML_SERVICE_URL: 'http://localhost:8001' // Different port for test ML service
        }
    };
    
    return envConfigs[env] || config;
};

/**
 * Print configuration summary (without sensitive data)
 */
const printConfigSummary = () => {
    console.log('📋 Configuration Summary:');
    console.log(`   Environment: ${config.NODE_ENV}`);
    console.log(`   Port: ${config.PORT}`);
    console.log(`   ML Service: ${config.ML_SERVICE_URL}`);
    console.log(`   CORS Origin: ${config.CORS_ORIGIN}`);
    console.log(`   Rate Limit: ${config.RATE_LIMIT_MAX_REQUESTS} requests per ${config.RATE_LIMIT_WINDOW_MS / 1000}s`);
    console.log(`   Request Logging: ${config.ENABLE_REQUEST_LOGGING}`);
    console.log(`   Max Text Length: ${config.MAX_TEXT_LENGTH} characters`);
    console.log(`   Max Batch Size: ${config.MAX_BATCH_SIZE} items`);
};

// Validate configuration on load
try {
    validateConfig();
} catch (error) {
    console.error('❌ Configuration Error:', error.message);
    process.exit(1);
}

module.exports = {
    ...config,
    validateConfig,
    getEnvConfig,
    printConfigSummary
};
