import React from 'react';

const ProfileButton = ({ children, onClick, variant = 'default' }) => {
  return (
    <button 
      className={`a-profile-btn ${variant === 'danger' ? 'variant-danger' : ''}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};
export default ProfileButton;