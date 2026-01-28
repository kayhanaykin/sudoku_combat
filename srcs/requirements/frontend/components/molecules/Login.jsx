import React, { useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { loginUser } from '../../services/api';
import '../../styles/login.css';

const INTRA_AUTH_URL = "https://localhost:8443/api/user/auth/login/";

const Login = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen)
    return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try
    {
      const userData = await loginUser(username, password);
      login(userData);
      onClose();
    }
    catch (err)
    {
      setError(err.message || "Login failed");
    }
    finally
    {
      setIsLoading(false);
    }
  };

  const handleIntraLogin = () => {
    window.location.href = INTRA_AUTH_URL;
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="login-title">Log In</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div style={{ color: '#e74c3c', textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
            disabled={isLoading}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
            disabled={isLoading}
          />
          
          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button 
            type="button" 
            onClick={handleIntraLogin}
            className="login-intra-btn"
            disabled={isLoading}
          >
            Sign in with 42
          </button>
        </form>

        <button onClick={onClose} className="login-close-btn" disabled={isLoading}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Login;