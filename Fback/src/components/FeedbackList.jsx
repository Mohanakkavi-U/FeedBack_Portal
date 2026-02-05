import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '../utils/api';
import FeedbackCard from './FeedbackCard';
import { statuses, priorities } from '../utils/helpers';
import './FeedbackList.css';

const FeedbackList = () => {
    const [feedback, setFeedback] = useState([]);
    const [filteredFeedback, setFilteredFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        sentiment: '',
        status: '',
        priority: '',
        search: '',
        repeatIssues: false,
    });

    useEffect(() => {
        fetchFeedback();

        // Check for URL parameters for repeat issues filter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('filter') === 'repeat-issues') {
            setFilters(prev => ({ ...prev, repeatIssues: true }));
        }
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, feedback]);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const response = await feedbackAPI.getAll();
            if (response.data.success) {
                setFeedback(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...feedback];

        if (filters.sentiment) {
            filtered = filtered.filter((f) => f.sentiment === filters.sentiment);
        }

        if (filters.repeatIssues) {
            filtered = filtered.filter((f) =>
                f.repeatAnalysis?.isRepeat ||
                f.priority === 'High Impact' ||
                f.priority === 'Critical'
            );
        }

        if (filters.status) {
            filtered = filtered.filter((f) => f.status === filters.status);
        }

        if (filters.priority) {
            filtered = filtered.filter((f) => f.priority === filters.priority);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(
                (f) =>
                    f.feedback.toLowerCase().includes(searchLower) ||
                    f.name.toLowerCase().includes(searchLower) ||
                    f.email.toLowerCase().includes(searchLower)
            );
        }

        setFilteredFeedback(filtered);
    };

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (id, updates) => {
        try {
            const response = await feedbackAPI.update(id, updates);
            if (response.data.success) {
                setFeedback((prev) =>
                    prev.map((f) => (f.id === id ? response.data.data : f))
                );
            }
        } catch (error) {
            console.error('Error updating feedback:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await feedbackAPI.delete(id);
            if (response.data.success) {
                setFeedback((prev) => prev.filter((f) => f.id !== id));
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
        }
    };

    const clearFilters = () => {
        setFilters({
            sentiment: '',
            status: '',
            priority: '',
            search: '',
            repeatIssues: false,
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading feedback...</p>
            </div>
        );
    }

    return (
        <div className="feedback-list-container fade-in">
            <div className="list-header">
                <h2>All Feedback</h2>
                <p className="text-secondary">
                    {filteredFeedback.length} of {feedback.length} feedback items
                </p>
            </div>

            <div className="filters-section card">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label className="filter-label">Search</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search feedback..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Repeat Issues</label>
                        <div className="repeat-issues-toggle">
                            <button
                                className={`btn-repeat ${filters.repeatIssues ? 'active' : ''}`}
                                onClick={() => handleFilterChange('repeatIssues', !filters.repeatIssues)}
                            >
                                <span className="repeat-icon">�</span>
                                {filters.repeatIssues ? 'Showing Repeat Issues' : 'Show Repeat Issues'}
                            </button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Sentiment</label>
                        <select
                            className="form-select"
                            value={filters.sentiment}
                            onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                        >
                            <option value="">All Sentiments</option>
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Status</label>
                        <select
                            className="form-select"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Priority</label>
                        <select
                            className="form-select"
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                        >
                            <option value="">All Priorities</option>
                            {priorities.map((priority) => (
                                <option key={priority} value={priority}>
                                    {priority}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group filter-actions">
                        <button className="btn btn-secondary" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="feedback-items">
                {filteredFeedback.length === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-icon">📭</div>
                        <h3>No feedback found</h3>
                        <p className="text-secondary">
                            {feedback.length === 0
                                ? 'No feedback has been submitted yet.'
                                : 'Try adjusting your filters.'}
                        </p>
                    </div>
                ) : (
                    filteredFeedback.map((item) => (
                        <FeedbackCard
                            key={item.id}
                            feedback={item}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default FeedbackList;
