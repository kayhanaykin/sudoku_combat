import React from 'react';

const ActionBtn = ({ className, children, ...props }) => 
{
    return (
        <button className={className} {...props}>
            {children}
        </button>
    );
};

export default ActionBtn;