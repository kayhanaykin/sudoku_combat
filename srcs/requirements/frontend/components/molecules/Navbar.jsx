import React, { useState } from 'react';
import Login from './Login';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <a href="/">Sudoku42</a>
        </div>
        <div className="auth-buttons">
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsLoginOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            Log In
          </button>
          
          <a href="/signup" className="btn btn-primary">Sign Up</a>
        </div>
      </nav>

      <Login 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  );
};

export default Navbar;