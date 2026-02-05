import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing user session on app load
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                // Check if session is still valid (24 hours)
                const loginTime = new Date(user.loginTime);
                const now = new Date();
                const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    setCurrentUser(user);
                } else {
                    // Session expired, clear it
                    localStorage.removeItem('currentUser');
                }
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('currentUser');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData) => {
        const userWithTimestamp = {
            ...userData,
            loginTime: new Date().toISOString()
        };
        console.log('AuthContext: Logging in user', userWithTimestamp);
        setCurrentUser(userWithTimestamp);
        localStorage.setItem('currentUser', JSON.stringify(userWithTimestamp));
        console.log('AuthContext: User logged in successfully');
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const hasRole = (role) => {
        const result = currentUser && currentUser.role === role;
        console.log('hasRole check:', { currentUser, requestedRole: role, result });
        return result;
    };

    const isAdmin = () => {
        return hasRole('admin');
    };

    const isUser = () => {
        return hasRole('user');
    };

    const value = {
        currentUser,
        isLoading,
        login,
        logout,
        hasRole,
        isAdmin,
        isUser,
        isAuthenticated: !!currentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
