import React from 'react';
import styled from 'styled-components';
import { device } from '../../utils/device';

// STYLED COMPONENTS
const StyledButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8vmin;
    padding: 0.3vmin 1.3vmin;
    font-size: 2vmin;
    font-weight: bold;
    color: #ffffff;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    border: none;
    border-radius: 1.5vmin;
    box-shadow: 0 0.6vmin 0 #1a252f, 0 1vmin 1.5vmin rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.1s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    outline: none;

    &:hover:not(:disabled)
    {
        transform: translateY(-0.2vmin);
        box-shadow: 0 0.8vmin 0 #1a252f, 0 1.2vmin 2vmin rgba(0,0,0,0.3);
    }

    &:active:not(:disabled)
    {
        transform: translateY(0.6vmin); 
        box-shadow: 0 0 0 #1a252f, 0 0.2vmin 0.5vmin rgba(0,0,0,0.2);
    }

    &:disabled
    {
        background: #95a5a6;
        box-shadow: 0 0.6vmin 0 #7f8c8d;
        color: #ecf0f1;
        cursor: not-allowed;
        opacity: 0.7;
    }

    @media ${device.tablet}
    {
        padding: 2vmin 4vmin;
        font-size: 2.5vmin;
        border-radius: 2vmin;
    }

    @media ${device.mobileL}
    {
        padding: 12px 20px;
        font-size: 14px;
        border-radius: 8px;
        gap: 6px;
    }
`;

const IconWrapper = styled.span`
    font-size: 1.7vmin;

    @media ${device.tablet}
    {
        font-size: 2.2vmin;
    }

    @media ${device.mobileL}
    {
        font-size: 16px;
    }
`;

const TextWrapper = styled.span`
    /* Text inherits styles from the button by default */
`;

// COMPONENT DEFINITION
const ActionBtn = ({ className = '', children, ...props }) => 
{
    let icon = '';
    let textContent = '';

    if (typeof children === 'string')
        textContent = children.toLowerCase();
    
    if (textContent.includes('erase'))
        icon = '🧹';
    else if (textContent.includes('hint'))
        icon = '💡';

    return (
        <StyledButton className={className} {...props}>
            
            {icon !== '' && 
            (
                <IconWrapper>
                    {icon}
                </IconWrapper>
            )}
            
            <TextWrapper>
                {children}
            </TextWrapper>

        </StyledButton>
    );
};

export default ActionBtn;