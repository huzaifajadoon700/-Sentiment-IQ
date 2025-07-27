/**
 * Sentiment analysis routes
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const sentimentService = require('../services/sentimentService');

const router = express.Router();

// Validation middleware for text input
const validateTextInput = [
    body('text')
        .trim()
        .notEmpty()
        .withMessage('Text is required')
        .isLength({ min: 1, max: 5000 })
        .withMessage('Text must be between 1 and 5000 characters')
        .matches(/^[\s\S]*$/)
        .withMessage('Invalid characters in text'),
    
    body('options.includeConfidence')
        .optional()
        .isBoolean()
        .withMessage('includeConfidence must be a boolean'),
    
    body('options.model')
        .optional()
        .isIn(['random_forest', 'logistic_regression', 'naive_bayes'])
        .withMessage('Invalid model type')
];

/**
 * POST /api/sentiment/analyze
 * Analyze sentiment of provided text
 */
router.post('/analyze', validateTextInput, async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { text, options = {} } = req.body;
        
        // Default options
        const analysisOptions = {
            includeConfidence: options.includeConfidence !== false, // default true
            model: options.model || 'random_forest'
        };

        console.log(`📝 Analyzing text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
        
        // Call sentiment analysis service
        const result = await sentimentService.analyzeSentiment(text, analysisOptions);
        
        console.log(`✅ Analysis complete: ${result.sentiment} (${result.confidence})`);
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
            processingTime: result.processingTime
        });

    } catch (error) {
        console.error('❌ Error in sentiment analysis:', error);
        next(error);
    }
});

/**
 * POST /api/sentiment/batch
 * Analyze sentiment for multiple texts
 */
router.post('/batch', [
    body('texts')
        .isArray({ min: 1, max: 100 })
        .withMessage('texts must be an array with 1-100 items'),
    
    body('texts.*')
        .trim()
        .notEmpty()
        .withMessage('Each text item is required')
        .isLength({ min: 1, max: 5000 })
        .withMessage('Each text must be between 1 and 5000 characters')
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { texts, options = {} } = req.body;
        
        console.log(`📝 Batch analyzing ${texts.length} texts`);
        
        // Call batch sentiment analysis service
        const results = await sentimentService.analyzeBatchSentiment(texts, options);
        
        console.log(`✅ Batch analysis complete: ${results.length} results`);
        
        res.json({
            success: true,
            data: results,
            count: results.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in batch sentiment analysis:', error);
        next(error);
    }
});

/**
 * GET /api/sentiment/models
 * Get available models information
 */
router.get('/models', async (req, res, next) => {
    try {
        const models = await sentimentService.getAvailableModels();
        
        res.json({
            success: true,
            data: models,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error getting models:', error);
        next(error);
    }
});

/**
 * GET /api/sentiment/stats
 * Get service statistics
 */
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await sentimentService.getServiceStats();
        
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error getting stats:', error);
        next(error);
    }
});

module.exports = router;
