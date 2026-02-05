import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout, isAdmin, isUser } = useAuth();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Don't show header on login page
    if (location.pathname === '/login') {
        return null;
    }

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">📊</div>
                        <div className="logo-text">
                            <h1>FeedBackPortal</h1>
                            <p>Customer Insights Platform</p>
                        </div>
                    </div>

                    <nav className="nav">
                        {isAdmin() && (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`nav-link ${isActive('/dashboard') || isActive('/') ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">📈</span>
                                    Dashboard
                                </Link>
                                <Link
                                    to="/feedback"
                                    className={`nav-link ${isActive('/feedback') ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">💬</span>
                                    All Feedback
                                </Link>
                            </>
                        )}
                        
                        {isUser() && (
                            <Link
                                to="/submit"
                                className={`nav-link ${isActive('/submit') ? 'active' : ''}`}
                            >
                                <span className="nav-icon">✍️</span>
                                Submit Feedback
                            </Link>
                        )}
                    </nav>

                    <div className="user-menu">
                        <div className="user-info">
                            <span className="user-name">{currentUser?.name}</span>
                            <span className="user-role">{currentUser?.role}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <span className="logout-icon">🚪</span>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
