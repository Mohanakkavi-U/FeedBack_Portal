import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { currentUser, isLoading, isAuthenticated, hasRole } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute Debug:', {
        currentUser,
        isLoading,
        isAuthenticated,
        requiredRole,
        hasRequiredRole: requiredRole ? hasRole(requiredRole) : 'N/A',
        path: location.pathname
    });

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        // Redirect to login with return URL
        return (
            <Navigate 
                to="/login" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    if (requiredRole && !hasRole(requiredRole)) {
        console.log('Access denied - insufficient role');
        return (
            <div className="access-denied">
                <div className="access-denied-card">
                    <h2>🚫 Access Denied</h2>
                    <p>
                        You don't have permission to access this page.
                        {requiredRole === 'admin' && ' This page requires administrator privileges.'}
                        {requiredRole === 'user' && ' This page is for regular users only.'}
                    </p>
                    <p><strong>Debug Info:</strong></p>
                    <p>Current User: {currentUser?.name} ({currentUser?.role})</p>
                    <p>Required Role: {requiredRole}</p>
                    <button 
                        onClick={() => window.history.back()}
                        className="back-btn"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    console.log('Access granted, rendering protected content');
    return children;
};

export default ProtectedRoute;
