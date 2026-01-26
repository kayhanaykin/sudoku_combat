import React, { useState } from 'react';
import Login from './Login';
import SignUp from './Signup';

const Navbar = () => {
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
        <div className="logo">
          <a href="/">Sudoku42</a>
        </div>
        <div className="auth-buttons">
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
        </div>
      </nav>

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
  );
};

export default Navbar;