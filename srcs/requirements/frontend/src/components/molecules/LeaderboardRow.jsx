import React from 'react';
import styled from 'styled-components';

// HELPER FUNCTION
const getRankIcon = (index) =>
{
    switch (index)
    {
        case 0:
          return '🥇';
        case 1:
          return '🥈';
        case 2:
          return '🥉';
        default:
          return `#${index + 1}`;
    }
};

// STYLED COMPONENTS
const RowContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 10px;
    transition: all 0.2s ease;
    
    background-color: ${props => 
        props.$rankIndex === 0 ? '#fef9c3' : 
        props.$rankIndex === 1 ? '#f3f4f6' : 
        props.$rankIndex === 2 ? '#ffedd5' : 
        '#ffffff'
    };
    
    border: 1px solid ${props => 
        props.$rankIndex === 0 ? '#fde047' : 
        props.$rankIndex === 1 ? '#e5e7eb' : 
        props.$rankIndex === 2 ? '#fdba74' : 
        '#f3f4f6'
    };

    &:hover 
    {
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }
`;

const RankIcon = styled.span`
    width: 40px;
    font-size: 1rem;
    font-weight: bold;
    color: #6b7280;
    text-align: center;
    flex-shrink: 0;
`;

const PlayerInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    padding-right: 10px;
`;

const DisplayName = styled.span`
    font-size: 1rem;
    font-weight: 600;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UsernameSubtitle = styled.span`
    font-size: 0.75rem;
    color: #313439;
`;

const PointsText = styled.span`
    font-size: 1rem;
    font-weight: 700;
    color: #000000;
    white-space: nowrap;
`;

// COMPONENT DEFINITION
const LeaderboardRow = ({ player, index }) =>
{
    const icon = getRankIcon(index);
    const displayName = player.display_name || player.username || `User #${player.user_id}`;
    const username = player.username;
    const wins = player.wins || 0;

    return (
        <RowContainer $rankIndex={index}>
            
            <RankIcon>
                {icon}
            </RankIcon>
            
            <PlayerInfo>
                <DisplayName>
                    {displayName}
                </DisplayName>
                {username !== undefined && username !== null && username !== '' && 
                (
                    <UsernameSubtitle>
                        @{username}
                    </UsernameSubtitle>
                )}
            </PlayerInfo>
            
            <PointsText>
                {wins} pts
            </PointsText>
            
        </RowContainer>
    );
};

export default LeaderboardRow;