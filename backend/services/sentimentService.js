/**
 * Sentiment Analysis Service
 * Handles communication with ML service and business logic
 */

const axios = require('axios');
const config = require('../utils/config');

class SentimentService {
    constructor() {
        this.mlServiceUrl = config.ML_SERVICE_URL;
        this.timeout = config.ML_SERVICE_TIMEOUT;
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastRequestTime: null
        };
    }

    /**
     * Analyze sentiment of a single text
     * @param {string} text - Text to analyze
     * @param {object} options - Analysis options
     * @returns {Promise<object>} Analysis result
     */
    async analyzeSentiment(text, options = {}) {
        const startTime = Date.now();
        
        try {
            this.stats.totalRequests++;
            
            const response = await axios.post(
                `${this.mlServiceUrl}/predict`,
                {
                    text: text,
                    include_probabilities: options.includeConfidence !== false,
                    model: options.model || 'random_forest'
                },
                {
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime, true);

            // Transform ML service response to our API format
            const result = this.transformMLResponse(response.data, processingTime);
            
            return result;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime, false);
            
            console.error('❌ ML Service Error:', error.message);
            
            if (error.code === 'ECONNREFUSED') {
                throw new Error('ML service is not available. Please ensure the Python service is running.');
            } else if (error.code === 'ETIMEDOUT') {
                throw new Error('ML service request timed out. Please try again.');
            } else if (error.response) {
                throw new Error(`ML service error: ${error.response.data?.error || error.response.statusText}`);
            } else {
                throw new Error('Failed to analyze sentiment. Please try again.');
            }
        }
    }

    /**
     * Analyze sentiment for multiple texts
     * @param {string[]} texts - Array of texts to analyze
     * @param {object} options - Analysis options
     * @returns {Promise<object[]>} Array of analysis results
     */
    async analyzeBatchSentiment(texts, options = {}) {
        const startTime = Date.now();
        
        try {
            this.stats.totalRequests++;
            
            const response = await axios.post(
                `${this.mlServiceUrl}/predict/batch`,
                {
                    texts: texts,
                    include_probabilities: options.includeConfidence !== false,
                    model: options.model || 'random_forest'
                },
                {
                    timeout: this.timeout * 2, // Double timeout for batch requests
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime, true);

            // Transform ML service response to our API format
            const results = response.data.predictions.map((prediction, index) => 
                this.transformMLResponse({
                    sentiment: prediction.sentiment,
                    confidence: prediction.confidence,
                    probabilities: prediction.probabilities
                }, processingTime / texts.length, texts[index])
            );
            
            return results;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime, false);
            
            console.error('❌ ML Service Batch Error:', error.message);
            throw this.handleMLServiceError(error);
        }
    }

    /**
     * Check ML service health
     * @param {boolean} detailed - Whether to return detailed health info
     * @returns {Promise<object>} Health status
     */
    async checkMLServiceHealth(detailed = false) {
        const startTime = Date.now();

        try {
            const endpoint = detailed ? '/health/detailed' : '/health';
            const url = `${this.mlServiceUrl}${endpoint}`;
            console.log(`🔍 Checking ML service health at: ${url}`);

            const response = await axios.get(url, { timeout: 5000 });

            const responseTime = Date.now() - startTime;
            console.log(`✅ ML service health check successful: ${response.status} (${responseTime}ms)`);

            return {
                status: 'healthy',
                responseTime: responseTime,
                ...(detailed && response.data)
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            console.log(`❌ ML service health check failed: ${error.message} (${responseTime}ms)`);

            return {
                status: 'unhealthy',
                responseTime: responseTime,
                error: error.message
            };
        }
    }

    /**
     * Get available models information
     * @returns {Promise<object>} Models information
     */
    async getAvailableModels() {
        try {
            const response = await axios.get(
                `${this.mlServiceUrl}/models`,
                { timeout: 5000 }
            );

            return response.data;

        } catch (error) {
            console.error('❌ Error getting models:', error.message);
            throw this.handleMLServiceError(error);
        }
    }

    /**
     * Get service statistics
     * @returns {object} Service statistics
     */
    getServiceStats() {
        return {
            ...this.stats,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            mlServiceUrl: this.mlServiceUrl
        };
    }

    /**
     * Transform ML service response to API format
     * @param {object} mlResponse - Response from ML service
     * @param {number} processingTime - Processing time in ms
     * @param {string} originalText - Original input text (optional)
     * @returns {object} Transformed response
     */
    transformMLResponse(mlResponse, processingTime, originalText = null) {
        const result = {
            sentiment: mlResponse.sentiment,
            confidence: parseFloat((mlResponse.confidence || 0).toFixed(3)),
            processingTime: `${processingTime}ms`
        };

        // Add probabilities if available
        if (mlResponse.probabilities) {
            result.probabilities = {};
            Object.keys(mlResponse.probabilities).forEach(key => {
                result.probabilities[key] = parseFloat(mlResponse.probabilities[key].toFixed(3));
            });
        }

        // Add original text for batch responses
        if (originalText) {
            result.text = originalText;
        }

        // Add sentiment emoji for better UX
        result.emoji = this.getSentimentEmoji(mlResponse.sentiment);

        return result;
    }

    /**
     * Get emoji for sentiment
     * @param {string} sentiment - Sentiment label
     * @returns {string} Emoji
     */
    getSentimentEmoji(sentiment) {
        const emojiMap = {
            'Positive': '😊',
            'Negative': '😞',
            'Neutral': '😐'
        };
        return emojiMap[sentiment] || '🤔';
    }

    /**
     * Update service statistics
     * @param {number} responseTime - Response time in ms
     * @param {boolean} success - Whether request was successful
     */
    updateStats(responseTime, success) {
        if (success) {
            this.stats.successfulRequests++;
        } else {
            this.stats.failedRequests++;
        }

        // Update average response time
        this.stats.averageResponseTime = Math.round(
            (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) / this.stats.totalRequests
        );

        this.stats.lastRequestTime = new Date().toISOString();
    }

    /**
     * Handle ML service errors
     * @param {Error} error - Error from ML service
     * @returns {Error} Formatted error
     */
    handleMLServiceError(error) {
        if (error.code === 'ECONNREFUSED') {
            return new Error('ML service is not available. Please ensure the Python service is running.');
        } else if (error.code === 'ETIMEDOUT') {
            return new Error('ML service request timed out. Please try again.');
        } else if (error.response) {
            return new Error(`ML service error: ${error.response.data?.error || error.response.statusText}`);
        } else {
            return new Error('Failed to communicate with ML service. Please try again.');
        }
    }
}

// Export singleton instance
module.exports = new SentimentService();
