import React from 'react';
import '../../styles/ActionBtn.css';

const ActionBtn = ({ className = '', children, ...props }) => 
{
    let icon = '';
    const text = typeof children === 'string' ? children.toLowerCase() : '';
    
    if (text.includes('erase'))
        icon = '🧹';
    else if (text.includes('hint'))
        icon = '💡';

    return (
        <button className={`game-action-btn ${className}`} {...props}>
            {icon && <span className="action-icon">{icon}</span>}
            <span className="action-text">{children}</span>
        </button>
    );
};

export default ActionBtn;