import React from 'react';
import { getRelativeTime, getToneColor } from '../utils/helpers';
import './FeedbackCard.css';

const FeedbackCard = ({ feedback, onUpdate, onDelete }) => {
    const {
        id,
        name,
        email,
        serviceType,
        rating,
        feedback: feedbackText,
        sentiment,
        priority,
        status,
        issueType,
        keywords,
        createdAt,
    } = feedback;

    const [expanded, setExpanded] = React.useState(false);

    const handleStatusChange = (newStatus) => {
        onUpdate(id, { status: newStatus });
    };

    const getSentimentEmoji = (sentiment) => {
        const emojis = {
            positive: '😊',
            neutral: '😐',
            negative: '😞',
        };
        return emojis[sentiment] || '😐';
    };

    return (
        <div className={`feedback-card fade-in ${expanded ? 'expanded' : ''} ${feedback.repeatAnalysis?.isRepeat || feedback.priority === 'High Impact' ? 'high-priority' : ''}`}>
            {(feedback.repeatAnalysis?.isRepeat || feedback.priority === 'High Impact') && (
                <div className="high-priority-indicator">
                    <span className="priority-badge">
                        {feedback.repeatAnalysis?.isRepeat ? '🔄 Repeat Issue' :
                            feedback.priority === 'High Impact' ? '🔴 High Impact' : '⚠️ Attention'}
                    </span>
                </div>
            )}
            <div className="feedback-header">
                <div className="feedback-user">
                    <div className="user-avatar">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <h4>{name}</h4>
                        <p className="text-muted">{email}</p>
                    </div>
                </div>
                <div className="feedback-meta">
                    <span className="time-ago">{getRelativeTime(createdAt)}</span>
                </div>
            </div>

            <div className="feedback-badges">
                <span className={`badge badge-${sentiment}`}>
                    {getSentimentEmoji(sentiment)} {sentiment}
                </span>
                <span className={`badge badge-${priority.toLowerCase().replace(' ', '-')}`}>
                    {priority}
                </span>
                {feedback.tone && (
                    <span className="badge" style={{ background: getToneColor(feedback.tone) + '20', color: getToneColor(feedback.tone), borderColor: getToneColor(feedback.tone) }}>
                        {feedback.tone === 'Appreciative' ? '❤️' :
                            feedback.tone === 'Constructive' ? '💡' :
                                feedback.tone === 'Critical' ? '🛑' :
                                    feedback.tone === 'Inquisitive' ? '❓' : 'ℹ️'} {feedback.tone}
                    </span>
                )}
                <span className={`badge status-${status.toLowerCase().replace(' ', '-')}`}>
                    {status}
                </span>
                {issueType && (
                    <span className="badge" style={{ background: 'rgba(240, 147, 251, 0.2)', color: '#f093fb' }}>
                        {issueType}
                    </span>
                )}
            </div>

            {rating > 0 && (
                <div className="feedback-rating">
                    <div className="star-rating">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
                                ★
                            </span>
                        ))}
                    </div>
                    <span className="rating-value">{rating}/5</span>
                </div>
            )}

            <div className="feedback-content">
                <p className={expanded ? '' : 'truncated'}>
                    {feedbackText}
                </p>
                {feedbackText.length > 200 && (
                    <button
                        className="btn-expand"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            {keywords && keywords.length > 0 && (
                <div className="feedback-keywords">
                    <span className="keywords-label">Keywords:</span>
                    <div className="keywords-list">
                        {keywords.slice(0, 5).map((kw, idx) => (
                            <span key={idx} className="keyword-tag">
                                {kw.word || kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="feedback-actions">
                <div className="status-buttons">
                    <button
                        className={`btn-status ${status === 'New' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('New')}
                    >
                        New
                    </button>
                    <button
                        className={`btn-status ${status === 'In Progress' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('In Progress')}
                    >
                        In Progress
                    </button>
                    <button
                        className={`btn-status ${status === 'Resolved' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('Resolved')}
                    >
                        Resolved
                    </button>
                    <button
                        className={`btn-status ${status === 'Closed' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('Closed')}
                    >
                        Closed
                    </button>
                </div>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                        if (window.confirm('Are you sure you want to delete this feedback?')) {
                            onDelete(id);
                        }
                    }}
                >
                    🗑️ Delete
                </button>
            </div>
        </div>
    );
};

export default FeedbackCard;
