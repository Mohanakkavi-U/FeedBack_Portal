/**
 * Firebase Firestore-based data storage
 * Provides CRUD operations for feedback data
 */

import { db } from './firebaseConfig.js';

const COLLECTION_NAME = 'feedback';

/**
 * Read all feedback from storage
 * @returns {Promise<array>} Array of feedback objects
 */
export async function getAllFeedback() {
    try {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error getting feedback:', error);
        return [];
    }
}

/**
 * Get feedback by ID
 * @param {string} id - Feedback ID
 * @returns {Promise<object|null>} Feedback object or null if not found
 */
export async function getFeedbackById(id) {
    try {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) return null;
        return doc.data();
    } catch (error) {
        console.error('Error getting feedback by ID:', error);
        return null;
    }
}

/**
 * Save new feedback
 * @param {object} feedback - Feedback object to save
 * @returns {Promise<object>} Saved feedback object
 */
export async function saveFeedback(feedback) {
    try {
        await db.collection(COLLECTION_NAME).doc(feedback.id).set(feedback);
        return feedback;
    } catch (error) {
        console.error('Error saving feedback:', error);
        throw error;
    }
}

/**
 * Update existing feedback
 * @param {string} id - Feedback ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object|null>} Updated feedback or null if not found
 */
export async function updateFeedback(id, updates) {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) return null;

        const updatedData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await docRef.update(updatedData);

        // Return accumulated data
        return { ...doc.data(), ...updatedData };
    } catch (error) {
        console.error('Error updating feedback:', error);
        return null; // Or throw depending on preference
    }
}

/**
 * Delete feedback
 * @param {string} id - Feedback ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteFeedback(id) {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get(); // Check existence first to match previous API behavior logic

        if (!doc.exists) return false;

        await docRef.delete();
        return true;
    } catch (error) {
        console.error('Error deleting feedback:', error);
        return false;
    }
}

/**
 * Get analytics data
 * @returns {Promise<object>} Analytics summary
 */
export async function getAnalytics() {
    // In a real production app at scale, you'd want to use aggregation queries or counters.
    // For this scale, fetching all is fine.
    const allFeedback = await getAllFeedback();

    // Sentiment distribution
    const sentimentDist = {
        positive: 0,
        neutral: 0,
        negative: 0
    };

    // Tone distribution
    const toneDist = {
        Constructive: 0,
        Appreciative: 0,
        Critical: 0,
        Inquisitive: 0,
        Neutral: 0
    };

    // Priority distribution
    const priorityDist = {
        'High Impact': 0,
        'Medium Impact': 0,
        'Low Impact': 0
    };

    // Status distribution
    const statusDist = {
        New: 0,
        'In Progress': 0,
        Resolved: 0,
        Closed: 0
    };

    // Issue type distribution
    const issueTypeDist = {};

    // Keyword frequency
    const keywordFreq = {};

    // Process each feedback
    allFeedback.forEach(feedback => {
        // Sentiment
        if (feedback.sentiment) {
            sentimentDist[feedback.sentiment] = (sentimentDist[feedback.sentiment] || 0) + 1;
        }

        // Tone
        if (feedback.tone) {
            toneDist[feedback.tone] = (toneDist[feedback.tone] || 0) + 1;
        }

        // Priority
        if (feedback.priority) {
            if (priorityDist[feedback.priority] !== undefined) {
                priorityDist[feedback.priority]++;
            } else {
                priorityDist[feedback.priority] = (priorityDist[feedback.priority] || 0) + 1;
            }
        }

        // Status
        if (feedback.status) {
            statusDist[feedback.status] = (statusDist[feedback.status] || 0) + 1;
        }

        // Issue type
        if (feedback.issueType) {
            issueTypeDist[feedback.issueType] = (issueTypeDist[feedback.issueType] || 0) + 1;
        }

        // Keywords
        if (feedback.keywords && Array.isArray(feedback.keywords)) {
            feedback.keywords.forEach(kw => {
                const word = kw.word || kw;
                keywordFreq[word] = (keywordFreq[word] || 0) + (kw.count || 1);
            });
        }
    });

    // Calculate average rating
    const ratingsSum = allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0);
    const avgRating = allFeedback.length > 0 ? (ratingsSum / allFeedback.length).toFixed(2) : 0;

    // Top keywords
    const topKeywords = Object.entries(keywordFreq)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    return {
        total: allFeedback.length,
        averageRating: parseFloat(avgRating),
        sentimentDistribution: sentimentDist,
        toneDistribution: toneDist,
        priorityDistribution: priorityDist,
        statusDistribution: statusDist,
        issueTypeDistribution: issueTypeDist,
        topKeywords
    };
}

/**
 * Get trend data (feedback over time)
 * @param {number} days - Number of days to analyze
 * @returns {Promise<array>} Trend data
 */
export async function getTrendData(days = 30) {
    const allFeedback = await getAllFeedback();
    const now = new Date();
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayFeedback = allFeedback.filter(f => {
            const feedbackDate = new Date(f.createdAt).toISOString().split('T')[0];
            return feedbackDate === dateStr;
        });

        const sentiments = {
            positive: 0,
            neutral: 0,
            negative: 0
        };

        dayFeedback.forEach(f => {
            if (f.sentiment) {
                sentiments[f.sentiment] = (sentiments[f.sentiment] || 0) + 1;
            }
        });

        trends.push({
            date: dateStr,
            total: dayFeedback.length,
            ...sentiments
        });
    }

    return trends;
}
