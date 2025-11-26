import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Here you would typically verify the token with your backend
            // and fetch the user's data. For now, we'll just set a dummy user.
            setUser({ loggedIn: true });
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        setUser({ loggedIn: true });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
