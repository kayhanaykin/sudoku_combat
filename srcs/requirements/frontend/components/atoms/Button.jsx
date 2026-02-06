import React from 'react';
import '../../styles/Button.css';

const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    className = '', 
    disabled = false,
    ...props 
}) => {
    return (
        <button
            type={type}
            className={`a-button ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;