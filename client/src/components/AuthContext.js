import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, setAccessToken } from '../components/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Verify the token here
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
                id: payload.identity.id,
                username: payload.identity.username,
                role: payload.identity.role
            });
            setAccessToken(token);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const { access_token } = await apiLogin(username, password);
            localStorage.setItem('accessToken', access_token);
            setAccessToken(access_token);
            const payload = JSON.parse(atob(access_token.split('.')[1]));
            setUser({
                id: payload.identity.id,
                username: payload.identity.username,
                role: payload.identity.role
            });
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};