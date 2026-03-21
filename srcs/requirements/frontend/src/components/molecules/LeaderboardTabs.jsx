import React from 'react';
import styled from 'styled-components';
import { device } from '../../utils/device';

// STYLED COMPONENTS
const TabsContainer = styled.div`
    display: flex;
    gap: 8px;
    background-color: #f3f4f6;
    padding: 6px;
    border-radius: 14px;
    margin-bottom: 25px;
    
    overflow-x: auto;
    scrollbar-width: none;
    
    &::-webkit-scrollbar 
    {
        display: none;
    }
`;

const TabButton = styled.button`
    flex: 1;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    background-color: ${props => props.$isActive ? '#4ade80' : 'transparent'};
    color: ${props => props.$isActive ? '#ffffff' : '#6b7280'};
    box-shadow: ${props => props.$isActive ? '0 2px 6px rgba(74, 222, 128, 0.4)' : 'none'};

    &:hover 
    {
        color: ${props => props.$isActive ? '#ffffff' : '#374151'};
        background-color: ${props => props.$isActive ? '#4ade80' : '#e5e7eb'};
    }

    @media ${device.mobileL}
    {
        padding: 8px 16px;
        font-size: 0.9rem;
    }
`;

// COMPONENT DEFINITION
const LeaderboardTabs = ({ modes, currentMode, onModeChange }) =>
{
    return (
        <TabsContainer>
            
            {modes.map((m) => (
                <TabButton
                    key={m}
                    $isActive={currentMode === m}
                    onClick={() => onModeChange(m)}
                >
                    {m}
                </TabButton>
            ))}
            
        </TabsContainer>
    );
};

export default LeaderboardTabs;