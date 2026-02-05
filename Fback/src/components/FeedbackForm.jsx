import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '../utils/api';
import { serviceTypes } from '../utils/helpers';
import './FeedbackForm.css';
import './SmartCoach.css';

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        serviceType: '',
        rating: 0,
        feedback: '',
    });

    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [coachTip, setCoachTip] = useState(null);

    // Smart Coach Logic
    useEffect(() => {
        const text = formData.feedback.toLowerCase();

        if (text.length > 5 && text.length < 20) {
            setCoachTip({
                title: "Thinking Helper",
                message: "A little more detail helps us fix things faster!",
                suggestion: "Try adding 'because...' or describing what happened."
            });
        } else if (text.includes("broken") || text.includes("doesn't work") || text.includes("bug")) {
            setCoachTip({
                title: "Bug Hunter Mode",
                message: "Found a bug? Help us squash it!",
                suggestion: "If possible, mention which page or button is acting up."
            });
        } else if (text.includes("dark mode") || text.includes("theme")) {
            setCoachTip({
                title: "Duplicate Defender",
                message: "You have great taste! 12 others requested Dark Mode recently.",
                suggestion: "We are actively working on this feature!"
            });
        } else if (text.includes("shipping") || text.includes("delivery")) {
            setCoachTip({
                title: "Logistics Assistant",
                message: "Talking about delivery?",
                suggestion: "Including an Order ID (if you have one) helps us track it instantly."
            });
        } else {
            setCoachTip(null);
        }
    }, [formData.feedback]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = (rating) => {
        setFormData((prev) => ({ ...prev, rating }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submission started:', formData);

        // Validation
        if (!formData.name || !formData.email || !formData.feedback) {
            console.log('Validation failed:', { name: formData.name, email: formData.email, feedback: formData.feedback });
            setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);
        console.log('Submitting to API...');

        try {
            const response = await feedbackAPI.create(formData);
            console.log('API Response:', response);

            if (response.data.success) {
                setSubmitStatus({
                    type: 'success',
                    message: 'Thank you! Your feedback has been submitted successfully.',
                });

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    serviceType: '',
                    rating: 0,
                    feedback: '',
                });
            } else {
                console.error('API Error Response:', response.data);
                setSubmitStatus({
                    type: 'error',
                    message: `Submission failed: ${response.data.error || 'Unknown error'}`,
                });
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            setSubmitStatus({
                type: 'error',
                message: `Network error: ${error.message || 'Please check your connection and try again.'}`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="feedback-form-container fade-in">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Share Your Feedback</h2>
                    <p className="text-secondary">
                        Help us improve our service by sharing your experience
                    </p>
                </div>

                {submitStatus && (
                    <div className={`alert alert-${submitStatus.type}`}>
                        {submitStatus.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Service Type</label>
                            <select
                                name="serviceType"
                                className="form-select"
                                value={formData.serviceType}
                                onChange={handleChange}
                            >
                                <option value="">Select service type</option>
                                {serviceTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Rating</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${star <= (hoveredRating || formData.rating) ? 'filled' : ''
                                        }`}
                                    onClick={() => handleRatingClick(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                >
                                    ★
                                </span>
                            ))}
                            {formData.rating > 0 && (
                                <span className="rating-text">{formData.rating} / 5</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Your Feedback *</label>

                        {coachTip && (
                            <div className="smart-coach-container">
                                <div className="coach-tip">
                                    <div className="coach-avatar">🤖</div>
                                    <div className="coach-content">
                                        <div className="coach-title">{coachTip.title}</div>
                                        <div className="coach-message">{coachTip.message}</div>
                                        <div className="coach-suggestion">{coachTip.suggestion}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <textarea
                            name="feedback"
                            className="form-textarea"
                            value={formData.feedback}
                            onChange={handleChange}
                            placeholder="Tell us about your experience..."
                            rows="6"
                            required
                        />
                        <div className="char-count">
                            {formData.feedback.length} characters
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner-sm"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <span>✓</span>
                                Submit Feedback
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
