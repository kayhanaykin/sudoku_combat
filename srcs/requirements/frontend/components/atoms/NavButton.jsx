import React from 'react';
import '../../styles/NavButton.css';

const NavButton = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`a-nav-btn ${variant}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default NavButton;