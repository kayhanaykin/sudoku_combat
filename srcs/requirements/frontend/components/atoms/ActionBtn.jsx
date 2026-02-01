import React from 'react';

const ActionBtn = ({ onClick, disabled, children, className = '' }) => {
  return (
    <button 
      className={`action-btn ${className}`} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ActionBtn;