import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import Login from './Login';
import SignUp from './Signup';
import '../../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const openLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  const openSignUp = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <a href="/">Sudoku42</a>
        </div>
        
        <div className="auth-buttons">
          {user ? (
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer' }}
            >
              Profile
            </button>
          ) : (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={openLogin}
                style={{ cursor: 'pointer' }}
              >
                Log In
              </button>
              
              <button 
                className="btn btn-primary" 
                onClick={openSignUp}
                style={{ cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {!user && (
        <>
          <Login 
            isOpen={isLoginOpen} 
            onClose={() => setIsLoginOpen(false)} 
          />

          <SignUp 
            isOpen={isSignUpOpen} 
            onClose={() => setIsSignUpOpen(false)}
            onSwitchToLogin={openLogin}
          />
        </>
      )}
    </>
  );
};

export default Navbar;