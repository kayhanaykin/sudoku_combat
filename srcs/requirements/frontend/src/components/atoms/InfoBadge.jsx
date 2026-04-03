import React from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const BadgeContainer = styled.div`
    padding: 0.8vmin 0;
    border-radius: 0.8vmin;
    font-weight: bold;
    box-shadow: 0 0.2vmin 0.5vmin rgba(0,0,0,0.1);
    width: 48%;
    text-align: center;
    
    font-size: ${props => 
    {
        if (props.$badgeType === 'difficulty')
            return '1.8vmin';
            
        return '2vmin';
    }};

    color: ${props => 
    {
        if (props.$badgeType === 'difficulty')
            return '#ffffff';
            
        return '#2c3e50';
    }};
    
    background-color: ${props => 
    {
        if (props.$badgeType === 'timer')
            return '#ecf0f1';
        else if (props.$badgeType === 'difficulty')
            return '#ff5151';
            
        return '#ecf0f1';
    }};

    border: 0.2vmin solid ${props => 
    {
        if (props.$badgeType === 'timer')
            return '#bdc3c7';
        else if (props.$badgeType === 'difficulty')
            return '#f50800';
            
        return '#bdc3c7';
    }};
`;

// COMPONENT DEFINITION
const InfoBadge = ({ text, type }) => 
{
    return (
        <BadgeContainer $badgeType={type}>
            {text}
        </BadgeContainer>
    );
};

export default InfoBadge;