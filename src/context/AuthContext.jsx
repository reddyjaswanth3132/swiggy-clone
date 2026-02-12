import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('swiggy_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        if (user) {
            localStorage.setItem('swiggy_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('swiggy_user');
        }
    }, [user]);

    const login = (userData) => {
        setUser(userData);
        setShowAuthModal(false);
    };

    const logout = () => {
        setUser(null);
    };

    const openAuthModal = () => setShowAuthModal(true);
    const closeAuthModal = () => setShowAuthModal(false);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            showAuthModal,
            openAuthModal,
            closeAuthModal
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
