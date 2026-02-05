/**
 * Express Server for Customer Feedback Portal
 * Provides RESTful API endpoints for feedback management
 */

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { analyzeFeedback } from './nlpAnalyzer.js';
import * as functions from 'firebase-functions';
import {
    getAllFeedback,
    getFeedbackById,
    saveFeedback,
    updateFeedback,
    deleteFeedback,
    getAnalytics,
    getTrendData
} from './dataStore.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: true, // Allow all origins for now to fix CORS, or specify the domain
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes - IMPORTANT: remove /api prefix if the function itself is named 'api'
// because Hosting rewrites /api/** to the function, stripping /api.
const router = express.Router();

/**
 * POST /api/feedback
 * Submit new feedback with automatic NLP analysis
 */
router.post('/feedback', async (req, res) => {
    try {
        const { name, email, serviceType, rating, feedback } = req.body;

        // Validation
        if (!name || !email || !feedback) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and feedback are required'
            });
        }

        // Create feedback object
        const feedbackObj = {
            id: uuidv4(),
            name,
            email,
            serviceType: serviceType || 'General',
            rating: parseInt(rating) || 0,
            feedback,
            status: 'New',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Get existing feedback for repeat analysis
        const existingFeedback = await getAllFeedback();

        // Perform NLP analysis with repeat detection
        const analysis = analyzeFeedback(feedbackObj, existingFeedback);

        // Merge analysis results
        const completeFeedback = {
            ...feedbackObj,
            ...analysis
        };

        // Save to storage
        const saved = await saveFeedback(completeFeedback);

        res.status(201).json({
            success: true,
            data: saved,
            message: 'Feedback submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit feedback'
        });
    }
});

/**
 * GET /api/feedback
 * Retrieve all feedback with optional filters
 */
router.get('/feedback', async (req, res) => {
    try {
        let feedback = await getAllFeedback();

        // Apply filters
        const { sentiment, status, priority, search } = req.query;

        if (sentiment) {
            feedback = feedback.filter(f => f.sentiment === sentiment);
        }

        if (status) {
            feedback = feedback.filter(f => f.status === status);
        }

        if (priority) {
            feedback = feedback.filter(f => f.priority === priority);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            feedback = feedback.filter(f =>
                f.feedback.toLowerCase().includes(searchLower) ||
                f.name.toLowerCase().includes(searchLower) ||
                f.email.toLowerCase().includes(searchLower)
            );
        }

        // Sort by date (newest first)
        feedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            data: feedback,
            count: feedback.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve feedback'
        });
    }
});

/**
 * GET /api/feedback/:id
 * Get specific feedback by ID
 */
router.get('/feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await getFeedbackById(id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                error: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed'
        });
    }
});

/**
 * PUT /api/feedback/:id
 * Update feedback status, priority, or other fields
 */
router.put('/feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow updating certain fields
        delete updates.id;
        delete updates.createdAt;

        const updated = await updateFeedback(id, updates);

        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            data: updated,
            message: 'Feedback updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed'
        });
    }
});

/**
 * DELETE /api/feedback/:id
 * Delete feedback
 */
router.delete('/feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteFeedback(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed'
        });
    }
});

/**
 * GET /api/analytics
 * Get aggregated analytics data
 */
router.get('/analytics', async (req, res) => {
    try {
        const analytics = await getAnalytics();

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed'
        });
    }
});

/**
 * GET /api/analytics/trends
 * Get time-based trend data
 */
router.get('/analytics/trends', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const trends = await getTrendData(days);

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed'
        });
    }
});

app.use('/api', router); // Keep /api prefix for local dev and legacy support
app.use('/', router);    // Add root support for Hosting rewrites

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server - only if not running in Firebase Functions
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Feedback Portal API running on http://localhost:${PORT}`);
        console.log(`📊 Analytics available at http://localhost:${PORT}/api/analytics`);
    });
}

// Export for Firebase Functions v1
export const api = functions.https.onRequest(app);
