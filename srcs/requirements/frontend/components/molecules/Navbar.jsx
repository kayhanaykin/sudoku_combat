// src/components/Navbar.jsx
import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <a href="/">Sudoku42</a>
      </div>
      <div className="auth-buttons">
        <a href="/login" className="btn btn-secondary">Log In</a>
        <a href="/signup" className="btn btn-primary">Sign Up</a>
      </div>
    </nav>
  );
};

export default Navbar;