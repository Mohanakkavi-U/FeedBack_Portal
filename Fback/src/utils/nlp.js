/**
 * NLP Analyzer for Customer Feedback (Frontend Version)
 */

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

const toneKeywords = {
    constructive: ['feature', 'suggestion', 'add', 'improve', 'better', 'would like', 'maybe', 'consider', 'idea', 'wish', 'missing', 'enhancement'],
    appreciative: ['love', 'great', 'amazing', 'thanks', 'easy', 'helpful', 'perfect', 'best', 'good', 'excellent', 'happy'],
    critical: ['broken', 'bug', 'crash', 'fail', 'error', 'slow', 'hard', 'difficult', 'confusing', 'hate', 'bad', 'worst', 'issue'],
    inquisitive: ['how', 'why', 'what', 'where', 'when', 'question', 'help', 'assist', 'support']
};

const impactKeywords = {
    high: ['blocking', 'crash', 'broken', 'lost', 'fail', 'urgent', 'immediately'],
    medium: ['issue', 'problem', 'slow', 'bug', 'difficult', 'confusing'],
    low: ['suggestion', 'minor', 'cosmetic', 'typo', 'nice to have']
};

export function analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    sentimentKeywords.positive.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) positiveCount += matches.length;
    });

    sentimentKeywords.negative.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) negativeCount += matches.length;
    });

    let sentiment = 'neutral';
    let score = 0;

    if (positiveCount > negativeCount) {
        sentiment = 'positive';
        score = Math.min((positiveCount / (positiveCount + negativeCount)) * 100, 100);
    } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        score = Math.min((negativeCount / (positiveCount + negativeCount)) * 100, 100);
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

export function detectTone(text) {
    const lowerText = text.toLowerCase();
    if (toneKeywords.constructive.some(k => lowerText.includes(k))) return 'Constructive';
    if (toneKeywords.appreciative.some(k => lowerText.includes(k))) return 'Appreciative';
    if (toneKeywords.critical.some(k => lowerText.includes(k))) return 'Critical';
    if (toneKeywords.inquisitive.some(k => lowerText.includes(k))) return 'Inquisitive';
    return 'Neutral';
}

export function extractKeywords(text) {
    const lowerText = text.toLowerCase();
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
        'its', 'our', 'their', 'this', 'that', 'these', 'those'];

    const words = lowerText.match(/\b[a-z]{3,}\b/g) || [];
    const wordFreq = {};
    words.forEach(word => {
        if (!stopWords.includes(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    return Object.entries(wordFreq)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}

export function determineImpact(text, tone) {
    const lowerText = text.toLowerCase();
    if (impactKeywords.high.some(k => lowerText.includes(k))) return 'High Impact';
    if (impactKeywords.medium.some(k => lowerText.includes(k)) || tone === 'Critical') return 'Medium Impact';
    return 'Low Impact';
}

export function analyzeFeedback(feedback, existingFeedback = []) {
    const text = feedback.feedback;
    const sentimentResult = analyzeSentiment(text);
    const keywords = extractKeywords(text);
    const tone = detectTone(text);
    const priority = determineImpact(text, tone);

    const bugKeywords = ['bug', 'error', 'crash', 'broken', 'not working', 'issue', 'problem'];
    let issueType = 'General Feedback';
    if (bugKeywords.some(keyword => text.toLowerCase().includes(keyword))) issueType = 'Bug';
    else if (['feature', 'add', 'need', 'suggest'].some(k => text.toLowerCase().includes(k))) issueType = 'Feature Request';
    else if (sentimentResult.sentiment === 'positive' && sentimentResult.positiveCount >= 2) issueType = 'Praise';

    // Simple repeat detection for frontend
    const repeatAnalysis = detectRepeatIssue(text, existingFeedback);
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

function detectRepeatIssue(text, existingFeedback = []) {
    if (!existingFeedback || existingFeedback.length === 0) {
        return {
            isRepeat: false,
            repeatCount: 0,
            similarIssues: [],
            priority: 'Low Impact'
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

        // Keyword overlap (70% weight)
        const commonKeywords = currentKeywords.filter(word =>
            feedbackKeywords.includes(word)
        );
        similarityScore += (commonKeywords.length / Math.max(currentKeywords.length, feedbackKeywords.length)) * 0.7;

        // Text similarity (20% weight)
        const currentWords = currentText.split(/\s+/);
        const feedbackWords = feedbackText.split(/\s+/);
        const commonWords = currentWords.filter(word =>
            feedbackWords.includes(word) && word.length > 3
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
    let priority = 'Low Impact';
    if (totalMatches >= 5) {
        priority = 'High Impact';
    } else if (totalMatches >= 3) {
        priority = 'Medium Impact';
    }

    return {
        isRepeat: totalMatches > 0,
        repeatCount: totalMatches,
        similarIssues: similarIssues.slice(0, 3),
        priority: priority,
        confidence: similarIssues.length > 0 ? similarIssues[0].similarityScore : 0
    };
}

function getHigherImpact(priority1, priority2) {
    const levels = { 'High Impact': 3, 'Medium Impact': 2, 'Low Impact': 1 };
    return (levels[priority1] || 1) >= (levels[priority2] || 1) ? priority1 : priority2;
}
