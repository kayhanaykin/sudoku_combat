import React, { useState } from 'react';
import '../../styles/login.css';
import { registerUser, loginUser, API_BASE_URL } from '../../services/api';

const INTRA_REGISTER_URL = `${API_BASE_URL}/api/user/auth/login/`;

const SignUp = ({ isOpen, onClose, onSwitchToLogin }) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword)
    {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try
    {
      await registerUser(username, email, password);
      console.log("Registration successful, logging in automatically...");

      const loginData = await loginUser(username, password);
      
      console.log("Login successful, tokens received.");

      if (loginData.access) {
        localStorage.setItem('access_token', loginData.access);
      }
      if (loginData.refresh) {
        localStorage.setItem('refresh_token', loginData.refresh);
      }

      setSuccessMessage("Account created and logged in! Redirecting...");
      
      setTimeout(() => {
        onClose();
        window.location.reload(); 
      }, 1500);
    }
    catch (err)
    {
      console.error(err);
      setError(err.message || "An error occurred.");
    }
    finally
    {
      setIsLoading(false);
    }
  };

  const handleIntraRegister = () => {
    window.location.href = INTRA_REGISTER_URL;
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="login-title">Sign Up</h2>
        
        {successMessage && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '10px', textAlign: 'center' }}>
            {successMessage}
          </div>
        )}

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
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? 'Creating Account & Logging In...' : 'Sign Up'}
          </button>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button 
            type="button" 
            onClick={handleIntraRegister}
            className="login-intra-btn"
            disabled={isLoading}
          >
            Sign up with 42
          </button>
        </form>
        
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          Already have an account?{' '}
          <span 
            onClick={onSwitchToLogin} 
            style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Log In
          </span>
        </p>

        <button onClick={onClose} className="login-close-btn" disabled={isLoading}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SignUp;