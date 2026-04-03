import React from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const StyledButton = styled.button`
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
    transition: all 0.2s ease;
    text-align: center;
    
    background-color: ${props => 
    {
        if (props.$variant === 'danger')
            return '#ef4444';
        else if (props.$variant === 'outline')
            return 'transparent';
            
        return '#4ade80';
    }};

    color: ${props => 
    {
        if (props.$variant === 'outline')
            return '#14532d';
            
        return '#ffffff';
    }};

    border: ${props => 
    {
        if (props.$variant === 'outline')
            return '2px solid #4ade80';
            
        return 'none';
    }};

    &:hover
    {
        background-color: ${props => 
        {
            if (props.$variant === 'danger')
                return '#dc2626';
            else if (props.$variant === 'outline')
                return '#f0fdf4';
                
            return '#22c55e';
        }};
    }
`;

// COMPONENT DEFINITION
const ProfileButton = ({ children, onClick, variant = 'default', ...props }) => 
{
    return (
        <StyledButton 
            $variant={variant} 
            onClick={onClick} 
            {...props}
        >
            {children}
        </StyledButton>
    );
};

export default ProfileButton;