import React, { useState, useEffect } from 'react';
import { analyticsAPI, feedbackAPI } from '../utils/api';
import SentimentChart from './charts/SentimentChart';
import ToneChart from './charts/ToneChart';
import TrendChart from './charts/TrendChart';
import BarChart from './charts/BarChart';
import KeywordCloud from './KeywordCloud';
import { calculatePercentage, getRelativeTime } from '../utils/helpers';
import './Dashboard.css';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [trends, setTrends] = useState([]);
    const [highPriorityFeedback, setHighPriorityFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trendDays, setTrendDays] = useState(7);

    useEffect(() => {
        fetchAnalytics();
        fetchHighPriorityFeedback();
    }, []);

    useEffect(() => {
        fetchTrends();
    }, [trendDays]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await analyticsAPI.getSummary();
            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrends = async () => {
        try {
            const response = await analyticsAPI.getTrends(trendDays);
            if (response.data.success) {
                setTrends(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching trends:', error);
        }
    };

    const fetchHighPriorityFeedback = async () => {
        try {
            const response = await feedbackAPI.getAll();
            if (response.data.success) {
                // Filter feedback with repeat issues or high priority
                const repeatIssues = response.data.data
                    .filter(feedback => {
                        // Show repeat issues or high priority items
                        return (feedback.repeatAnalysis?.isRepeat) ||
                            (feedback.priority === 'High Impact' || feedback.priority === 'Critical');
                    })
                    .sort((a, b) => {
                        // Sort by repeat count first, then by priority level
                        const aRepeatCount = a.repeatAnalysis?.repeatCount || 0;
                        const bRepeatCount = b.repeatAnalysis?.repeatCount || 0;

                        if (aRepeatCount !== bRepeatCount) {
                            return bRepeatCount - aRepeatCount;
                        }

                        // Then sort by priority level
                        const priorityLevels = { 'Critical': 4, 'High Impact': 3, 'High': 3, 'Medium Impact': 2, 'Medium': 2, 'Low Impact': 1, 'Low': 1 };
                        const aPriorityLevel = priorityLevels[a.priority] || 0;
                        const bPriorityLevel = priorityLevels[b.priority] || 0;

                        return bPriorityLevel - aPriorityLevel;
                    })
                    .slice(0, 5); // Show top 5 most critical repeat issues
                setHighPriorityFeedback(repeatIssues);
            }
        } catch (error) {
            console.error('Error fetching repeat issues:', error);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="empty-state card">
                <div className="empty-icon">📊</div>
                <h3>No data available</h3>
                <p className="text-secondary">Submit some feedback to see analytics</p>
            </div>
        );
    }

    const totalSentiment =
        analytics.sentimentDistribution.positive +
        analytics.sentimentDistribution.neutral +
        analytics.sentimentDistribution.negative;

    const sentimentPercentages = {
        positive: calculatePercentage(
            analytics.sentimentDistribution.positive,
            totalSentiment
        ),
        neutral: calculatePercentage(
            analytics.sentimentDistribution.neutral,
            totalSentiment
        ),
        negative: calculatePercentage(
            analytics.sentimentDistribution.negative,
            totalSentiment
        ),
    };

    return (
        <div className="dashboard-container fade-in">
            <div className="dashboard-header">
                <h2>Analytics Dashboard</h2>
                <p className="text-secondary">
                    Comprehensive insights from customer feedback
                </p>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card card">
                    <div className="metric-icon">📊</div>
                    <div className="metric-content">
                        <h3 className="metric-value">{analytics.total}</h3>
                        <p className="metric-label">Total Feedback</p>
                    </div>
                </div>

                <div className="metric-card card">
                    <div className="metric-icon">⭐</div>
                    <div className="metric-content">
                        <h3 className="metric-value">{analytics.averageRating.toFixed(1)}</h3>
                        <p className="metric-label">Average Rating</p>
                    </div>
                </div>

                <div className="metric-card card">
                    <div className="metric-icon">😊</div>
                    <div className="metric-content">
                        <h3 className="metric-value">{sentimentPercentages.positive}%</h3>
                        <p className="metric-label">Positive Sentiment</p>
                    </div>
                </div>

                <div className="metric-card card">
                    <div className="metric-icon">🚨</div>
                    <div className="metric-content">
                        <h3 className="metric-value">
                            {(analytics.priorityDistribution['High Impact'] || 0) +
                                (analytics.priorityDistribution['Critical'] || 0)}
                        </h3>
                        <p className="metric-label">High Impact</p>
                    </div>
                </div>
            </div>

            {/* High Priority Issues Section */}
            {highPriorityFeedback.length > 0 && (
                <div className="high-priority-section">
                    <div className="card">
                        <div className="card-header">
                            <div className="flex-between">
                                <h3 className="card-title">
                                    <span className="priority-indicator">🚨</span>
                                    Repeat Issues & High Priority
                                </h3>
                                <span className="priority-count">{highPriorityFeedback.length} items</span>
                            </div>
                        </div>
                        <div className="high-priority-list">
                            {highPriorityFeedback.map((feedback) => (
                                <div key={feedback.id} className="high-priority-item">
                                    <div className="priority-header">
                                        <div className="priority-info">
                                            <div className="repeat-info">
                                                {feedback.repeatAnalysis?.isRepeat ? (
                                                    <div className="repeat-indicator">
                                                        <span className="repeat-icon">🔄</span>
                                                        <span className="repeat-count">
                                                            {feedback.repeatAnalysis.repeatCount} similar issues
                                                        </span>
                                                        <span className="repeat-confidence">
                                                            ({Math.round(feedback.repeatAnalysis.confidence * 100)}% match)
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="priority-indicator-single">
                                                        <span className="priority-icon">⚠️</span>
                                                        <span className="priority-label">High Priority</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="priority-meta">
                                                <span className="priority-date">{getRelativeTime(feedback.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="priority-badge">
                                            {feedback.priority === 'High Impact' ? '🔴 High Impact' :
                                                feedback.priority === 'Medium Impact' ? '🟡 Medium Impact' :
                                                    feedback.priority === 'Low Impact' ? '🟢 Low Impact' :
                                                        feedback.priority}
                                        </div>
                                    </div>
                                    <div className="priority-content">
                                        <p className="priority-feedback">{feedback.feedback}</p>
                                        <div className="priority-footer">
                                            <span className="priority-user">{feedback.name}</span>
                                            <span className="priority-sentiment">
                                                Sentiment: {feedback.sentiment}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="priority-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => window.location.href = '/feedback?filter=repeat-issues'}
                            >
                                View All Repeat Issues
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div className="charts-grid">
                <div className="chart-card card">
                    <div className="card-header">
                        <h3 className="card-title">Sentiment Distribution</h3>
                    </div>
                    <SentimentChart data={analytics.sentimentDistribution} />
                </div>

                <div className="chart-card card">
                    <div className="card-header">
                        <h3 className="card-title">Tone Analysis</h3>
                    </div>
                    <ToneChart data={analytics.toneDistribution} />
                </div>
            </div>

            {/* Trends Section */}
            <div className="card">
                <div className="card-header">
                    <div className="flex-between">
                        <h3 className="card-title">Sentiment Trends</h3>
                        <div className="trend-controls">
                            <button
                                className={`btn-trend ${trendDays === 7 ? 'active' : ''}`}
                                onClick={() => setTrendDays(7)}
                            >
                                7 Days
                            </button>
                            <button
                                className={`btn-trend ${trendDays === 14 ? 'active' : ''}`}
                                onClick={() => setTrendDays(14)}
                            >
                                14 Days
                            </button>
                            <button
                                className={`btn-trend ${trendDays === 30 ? 'active' : ''}`}
                                onClick={() => setTrendDays(30)}
                            >
                                30 Days
                            </button>
                        </div>
                    </div>
                </div>
                <TrendChart data={trends} />
            </div>

            {/* Additional Insights */}
            <div className="insights-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Top Keywords</h3>
                    </div>
                    <KeywordCloud keywords={analytics.topKeywords} />
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Issue Types</h3>
                    </div>
                    <BarChart data={analytics.issueTypeDistribution} title="Issue Types" color="#f093fb" />
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Priority Distribution</h3>
                    </div>
                    <BarChart data={analytics.priorityDistribution} title="Priority" color="#f5576c" />
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Status Overview</h3>
                    </div>
                    <BarChart data={analytics.statusDistribution} title="Status" color="#00f2fe" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
