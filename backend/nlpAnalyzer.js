/**
 * NLP Analyzer for Customer Feedback
 * Performs keyword-based sentiment analysis and keyword extraction
 */

// Sentiment keywords
const sentimentKeywords = {
    positive: [
        'excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect',
        'awesome', 'brilliant', 'outstanding', 'superb', 'impressed', 'helpful',
        'fast', 'easy', 'smooth', 'reliable', 'efficient', 'satisfied', 'happy',
        'good', 'best', 'thank', 'appreciate', 'recommend', 'pleased'
    ],
    negative: [
        'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'disappointing',
        'frustrated', 'angry', 'annoying', 'slow', 'broken', 'bug', 'issue',
        'problem', 'error', 'fail', 'crash', 'useless', 'waste', 'hate',
        'difficult', 'confusing', 'complicated', 'unreliable', 'unresponsive'
    ]
};

// Category keywords are removed as the feature is deleted.

// Priority keywords (indicate urgency)
// Tone keywords (indicates the nature of feedback)
const toneKeywords = {
    constructive: ['feature', 'suggestion', 'add', 'improve', 'better', 'would like', 'maybe', 'consider', 'idea', 'wish', 'missing', 'enhancement'],
    appreciative: ['love', 'great', 'amazing', 'thanks', 'easy', 'helpful', 'perfect', 'best', 'good', 'excellent', 'happy'],
    critical: ['broken', 'bug', 'crash', 'fail', 'error', 'slow', 'hard', 'difficult', 'confusing', 'hate', 'bad', 'worst', 'issue'],
    inquisitive: ['how', 'why', 'what', 'where', 'when', 'question', 'help', 'assist', 'support']
};

// Impact keywords (replacing 'priority')
const impactKeywords = {
    high: ['blocking', 'crash', 'broken', 'lost', 'fail', 'urgent', 'immediately'],
    medium: ['issue', 'problem', 'slow', 'bug', 'difficult', 'confusing'],
    low: ['suggestion', 'minor', 'cosmetic', 'typo', 'nice to have']
};

/**
 * Analyze sentiment of feedback text
 * @param {string} text - Feedback text
 * @returns {object} Sentiment analysis result
 */
export function analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    // Count positive keywords
    sentimentKeywords.positive.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) positiveCount += matches.length;
    });

    // Count negative keywords
    sentimentKeywords.negative.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) negativeCount += matches.length;
    });

    // Determine sentiment
    let sentiment = 'neutral';
    let score = 0;

    if (positiveCount > negativeCount) {
        sentiment = 'positive';
        score = Math.min((positiveCount / (positiveCount + negativeCount)) * 100, 100);
    } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        score = Math.min((negativeCount / (positiveCount + negativeCount)) * 100, 100);
    } else if (positiveCount === 0 && negativeCount === 0) {
        sentiment = 'neutral';
        score = 50;
    } else {
        sentiment = 'neutral';
        score = 50;
    }

    return {
        sentiment,
        score: Math.round(score),
        positiveCount,
        negativeCount
    };
}

/**
 * Category detection has been removed.
 */

/**
 * Detect tone of feedback
 * @param {string} text 
 * @returns {string} Detected tone (Constructive, Appreciative, Critical, Inquisitive, Neutral)
 */
export function detectTone(text) {
    const lowerText = text.toLowerCase();

    // Check for constructive first (suggestions often contain critical words but are helpful)
    if (toneKeywords.constructive.some(k => lowerText.includes(k))) return 'Constructive';

    // Check others
    if (toneKeywords.appreciative.some(k => lowerText.includes(k))) return 'Appreciative';
    if (toneKeywords.critical.some(k => lowerText.includes(k))) return 'Critical';
    if (toneKeywords.inquisitive.some(k => lowerText.includes(k))) return 'Inquisitive';

    return 'Neutral';
}

/**
 * Extract keywords from feedback text
 * @param {string} text - Feedback text
 * @returns {array} Array of keywords with frequency
 */
export function extractKeywords(text) {
    const lowerText = text.toLowerCase();

    // Remove common stop words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
        'its', 'our', 'their', 'this', 'that', 'these', 'those'];

    // Extract words
    const words = lowerText.match(/\b[a-z]{3,}\b/g) || [];

    // Count word frequency
    const wordFreq = {};
    words.forEach(word => {
        if (!stopWords.includes(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    // Convert to array and sort by frequency
    const keywords = Object.entries(wordFreq)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 keywords

    return keywords;
}

/**
 * Determine impact level based on tone and keywords
 * @param {string} text - Feedback text
 * @param {string} tone - Detected tone
 * @returns {string} Impact level
 */
export function determineImpact(text, tone) {
    const lowerText = text.toLowerCase();

    // High Impact
    if (impactKeywords.high.some(k => lowerText.includes(k))) return 'High Impact';

    // Medium Impact (or Critical Tone)
    if (impactKeywords.medium.some(k => lowerText.includes(k)) || tone === 'Critical') return 'Medium Impact';

    // Low Impact
    return 'Low Impact';
}

/**
 * Detect if feedback is a repeat issue based on similarity to existing feedback
 * @param {string} text - Current feedback text
 * @param {string} category - Feedback category
 * @param {Array} existingFeedback - Array of existing feedback objects
 * @returns {object} Repeat analysis result
 */
export function detectRepeatIssue(text, category, existingFeedback = []) {
    if (!existingFeedback || existingFeedback.length === 0) {
        return {
            isRepeat: false,
            repeatCount: 0,
            similarIssues: [],
            priority: 'Low'
        };
    }

    const currentKeywords = extractKeywords(text).map(k => k.word);
    const currentText = text.toLowerCase();

    let similarIssues = [];
    let totalMatches = 0;

    // Check against existing feedback (last 30 days for relevance)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentFeedback = existingFeedback.filter(f =>
        new Date(f.createdAt) > thirtyDaysAgo
    );

    recentFeedback.forEach(feedback => {
        const feedbackText = (feedback.feedback || '').toLowerCase();
        const feedbackKeywords = feedback.keywords ?
            feedback.keywords.map(k => k.word || k) : [];

        // Calculate similarity score
        let similarityScore = 0;

        // Keyword overlap (70% weight) - increased weight due to category removal
        const commonKeywords = currentKeywords.filter(word =>
            feedbackKeywords.includes(word)
        );
        similarityScore += (commonKeywords.length / Math.max(currentKeywords.length, feedbackKeywords.length)) * 0.7;

        // Text similarity (20% weight) - simple word overlap
        const currentWords = currentText.split(/\s+/);
        const feedbackWords = feedbackText.split(/\s+/);
        const commonWords = currentWords.filter(word =>
            feedbackWords.includes(word) && word.length > 3 // Only meaningful words
        );
        similarityScore += (commonWords.length / Math.max(currentWords.length, feedbackWords.length)) * 0.2;

        // Consider it similar if score > 0.4
        if (similarityScore > 0.4) {
            similarIssues.push({
                id: feedback.id,
                text: feedback.feedback,
                createdAt: feedback.createdAt,
                similarityScore: similarityScore,
                commonKeywords: commonKeywords
            });
            totalMatches++;
        }
    });

    // Sort by similarity score
    similarIssues.sort((a, b) => b.similarityScore - a.similarityScore);

    // Determine priority based on repeat count
    // Determine impact based on repeat count
    let priority = 'Low Impact';
    if (totalMatches >= 5) {
        priority = 'High Impact';
    } else if (totalMatches >= 3) {
        priority = 'Medium Impact';
    }

    return {
        isRepeat: totalMatches > 0,
        repeatCount: totalMatches,
        similarIssues: similarIssues.slice(0, 3), // Top 3 most similar
        priority: priority,
        confidence: similarIssues.length > 0 ? similarIssues[0].similarityScore : 0
    };
}

/**
 * Classify issue type
 * @param {string} text - Feedback text
 * @param {object} sentimentResult - Sentiment analysis result
 * @returns {string} Issue type
 */
export function classifyIssueType(text, sentimentResult) {
    const lowerText = text.toLowerCase();

    // Bug indicators
    const bugKeywords = ['bug', 'error', 'crash', 'broken', 'not working', 'issue', 'problem'];
    if (bugKeywords.some(keyword => lowerText.includes(keyword))) {
        return 'Bug';
    }

    // Feature request indicators
    const featureKeywords = ['feature', 'add', 'need', 'would like', 'suggestion', 'improve', 'enhancement'];
    if (featureKeywords.some(keyword => lowerText.includes(keyword))) {
        return 'Feature Request';
    }

    // Praise indicators
    if (sentimentResult.sentiment === 'positive' && sentimentResult.positiveCount >= 2) {
        return 'Praise';
    }

    // Default to complaint if negative
    if (sentimentResult.sentiment === 'negative') {
        return 'Complaint';
    }

    return 'General Feedback';
}

/**
 * Complete feedback analysis
 * @param {object} feedback - Feedback object
 * @param {Array} existingFeedback - Array of existing feedback objects
 * @returns {object} Complete analysis result
 */
export function analyzeFeedback(feedback, existingFeedback = []) {
    const text = feedback.feedback;

    // Perform all analyses
    const sentimentResult = analyzeSentiment(text);
    const keywords = extractKeywords(text);
    const tone = detectTone(text);
    const priority = determineImpact(text, tone); // We use 'priority' field for compatibility but store 'Impact'
    const issueType = classifyIssueType(text, sentimentResult);
    const repeatAnalysis = detectRepeatIssue(text, null, existingFeedback);

    // Use repeat analysis impact if it's higher
    const finalPriority = getHigherImpact(priority, repeatAnalysis.priority);

    return {
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        keywords,
        priority: finalPriority,
        tone,
        issueType,
        repeatAnalysis,
        analyzedAt: new Date().toISOString()
    };
}

/**
 * Get higher impact
 */
function getHigherImpact(p1, p2) {
    const levels = { 'High Impact': 3, 'Medium Impact': 2, 'Low Impact': 1 };
    return (levels[p1] || 1) >= (levels[p2] || 1) ? p1 : p2;
}
