import React from 'react';
import styled from 'styled-components';
import { device } from '../../utils/device';

// STYLED COMPONENTS
const TabsContainer = styled.div`
    display: flex;
    gap: ${props => props.$compact ? '6px' : '8px'};
    background-color: #f3f4f6;
    padding: ${props => props.$compact ? '5px' : '6px'};
    border-radius: 14px;
    margin-bottom: ${props => props.$compact ? '14px' : '25px'};
    
    overflow-x: ${props => props.$noScroll ? 'hidden' : 'auto'};
    scrollbar-width: none;
    
    &::-webkit-scrollbar 
    {
        display: none;
    }
`;

const TabButton = styled.button`
    flex: 1;
    min-width: 0;
    padding: ${props => props.$compact ? '7px 8px' : '10px 20px'};
    border: none;
    border-radius: 10px;
    font-size: ${props => props.$compact ? '0.8rem' : '1rem'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

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
        padding: ${props => props.$compact ? '6px 7px' : '8px 16px'};
        font-size: ${props => props.$compact ? '0.75rem' : '0.9rem'};
    }
`;

// COMPONENT DEFINITION
const LeaderboardTabs = ({ modes, currentMode, onModeChange, compact = false, noScroll = false }) =>
{
    return (
        <TabsContainer $compact={compact} $noScroll={noScroll}>
            
            {modes.map((m) => (
                <TabButton
                    key={m}
                    $isActive={currentMode === m}
                    $compact={compact}
                    onClick={() => onModeChange(m)}
                >
                    {m}
                </TabButton>
            ))}
            
        </TabsContainer>
    );
};

export default LeaderboardTabs;