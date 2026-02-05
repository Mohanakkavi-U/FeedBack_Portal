import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user' // 'user' or 'admin'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // Mock user database (in production, this would be handled by backend)
    const mockUsers = {
        user: {
            email: 'user@feedportal.com',
            password: 'FeedPortal2026!',
            name: 'Regular User',
            role: 'user'
        },
        admin: {
            email: 'admin@feedportal.com',
            password: 'AdminPortal2026!',
            name: 'Administrator',
            role: 'admin'
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check credentials against mock database
            const userRole = formData.role;
            const expectedUser = mockUsers[userRole];

            if (formData.email === expectedUser.email && formData.password === expectedUser.password) {
                // Create user info object
                const userInfo = {
                    id: userRole === 'admin' ? 'admin-001' : 'user-001',
                    name: expectedUser.name,
                    email: expectedUser.email,
                    role: expectedUser.role
                };

                // Use AuthContext login method to properly set authentication state
                console.log('Logging in user:', userInfo);
                login(userInfo);
                console.log('Login successful, redirecting...');

                // Redirect based on role
                if (userRole === 'admin') {
                    navigate('/dashboard');
                } else {
                    navigate('/submit');
                }
            } else {
                setError('Invalid email or password');
            }
        } catch (error) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemoCredentials = (role) => {
        const user = mockUsers[role];
        setFormData({
            email: user.email,
            password: user.password,
            role: role
        });
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">FeedPortal</h1>
                    <p className="login-subtitle">Customer Feedback Management System</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="role-selector">
                        <label className="role-label">Login as:</label>
                        <div className="role-buttons">
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'user' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                            >
                                👤 User
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                            >
                                👨‍💼 Admin
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            `Login as ${formData.role === 'admin' ? 'Administrator' : 'User'}`
                        )}
                    </button>
                </form>

                <div className="login-qr-section">
                    <div className="qr-divider">
                        <span>OR</span>
                    </div>
                    <h3>Quick Feedback</h3>
                    <p>Scan to submit feedback without logging in</p>
                    <div className="login-qr-wrapper">
                        <img src="/feedback_qr.png" alt="Feedback QR Code" className="login-qr-image" />
                    </div>
                </div>

                <div className="demo-credentials">
                    <h3>Demo Credentials:</h3>
                    <div className="demo-buttons">
                        <button
                            type="button"
                            className="demo-btn"
                            onClick={() => fillDemoCredentials('user')}
                        >
                            👤 Fill User Credentials
                        </button>
                        <button
                            type="button"
                            className="demo-btn"
                            onClick={() => fillDemoCredentials('admin')}
                        >
                            👨‍💼 Fill Admin Credentials
                        </button>
                    </div>
                    <div className="demo-info">
                        <p><strong>User:</strong> user@feedportal.com / FeedPortal2026!</p>
                        <p><strong>Admin:</strong> admin@feedportal.com / AdminPortal2026!</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
