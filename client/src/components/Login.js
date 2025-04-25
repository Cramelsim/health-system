import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.trim() // Trim whitespace
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate inputs
        if (!formData.username || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        
        try {
            const success = await login(formData.username, formData.password);
            
            if (success) {
                navigate('/');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        autoComplete="username"
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                        minLength="8"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={isLoading ? 'btn-loading' : 'btn-primary'}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default Login;