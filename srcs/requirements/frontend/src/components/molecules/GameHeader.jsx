import React from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const HeaderContainer = styled.div`
    display: flex;
    gap: 1.5vmin;
    margin-bottom: 1.5vmin;
    width: 45vmin;
    justify-content: space-between;

    @media (max-width: 768px)
    {
        width: 80vmin;
    }
`;

const BaseBadge = styled.div`
    padding: 0.8vmin 0;
    border-radius: 0.8vmin;
    font-size: 2vmin;
    font-weight: bold;
    width: 48%;
    text-align: center;
    box-shadow: 0 0.2vmin 0.5vmin rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
`;

const TimerBadge = styled(BaseBadge)`
    background-color: #ecf0f1; 
    border: 0.2vmin solid #bdc3c7;
    color: #2c3e50;
`;

const DifficultyBadge = styled(BaseBadge)`
    color: #ffffff;
    font-size: 1.8vmin;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    
    background-color: ${props => props.$bg};
    border: 0.2vmin solid ${props => props.$border};
`;

// COMPONENT DEFINITION
const GameHeader = ({ timer, difficulty }) => 
{
    let bgColor = '#95a5a6';
    let borderColor = '#7f8c8d';
    let diffLabel = 'Unknown';

    if (difficulty)
    {
        const d = String(difficulty).toLowerCase();
        diffLabel = String(difficulty);

        if (d === '1' || d === 'easy')
        {
            bgColor = '#31e67c';
            borderColor = '#0ebf57';
            diffLabel = 'Easy';
        }
        else if (d === '2' || d === 'medium')
        {
            bgColor = '#28a4f6';
            borderColor = '#2980b9';
            diffLabel = 'Medium';
        }
        else if (d === '3' || d === 'hard')
        {
            bgColor = '#faca08';
            borderColor = '#f39c12';
            diffLabel = 'Hard';
        }
        else if (d === '4' || d === 'expert')
        {
            bgColor = '#f17406';
            borderColor = '#d35400';
            diffLabel = 'Expert';
        }
        else if (d === '5' || d === 'extreme')
        {
            bgColor = '#f5250d';
            borderColor = '#a21607';
            diffLabel = 'Extreme';
        }
    }

    let displayTimer = timer;
    if (typeof timer === 'number')
    {
        const m = Math.floor(timer / 60).toString().padStart(2, '0');
        const s = (timer % 60).toString().padStart(2, '0');
        displayTimer = `${m}:${s}`;
    }

    return (
        <HeaderContainer>
            
            <TimerBadge>
                ⏱ {displayTimer}
            </TimerBadge>

            <DifficultyBadge $bg={bgColor} $border={borderColor}>
                {diffLabel}
            </DifficultyBadge>
            
        </HeaderContainer>
    );
};

export default GameHeader;