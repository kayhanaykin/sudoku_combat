import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../src/context/AuthContext';
import { device } from '../../src/utils/device';
import PlayerInfoPopup from './PlayerInfoPopup';

// HELPER FUNCTIONS
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

const calculateWinRate = (wins, games) =>
{
    if (!games || games === 0)
    {
        return "0.0%";
    }
    
    const rate = (wins / games) * 100;
    return rate.toFixed(1) + "%";
};

// STYLED COMPONENTS
const RowContainer = styled.div`
    display: grid;
    grid-template-columns: 50px 2fr 1fr 1.2fr 1fr;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    background-color: ${props => 
    {
        switch (props.$rankIndex)
        {
            case 0:
                return '#fef9c3';
            case 1:
                return '#f3f4f6';
            case 2:
                return '#ffedd5';
            default:
                return '#ffffff';
        }
    }};
    
    border: 1px solid ${props => 
    {
        switch (props.$rankIndex)
        {
            case 0:
                return '#fde047';
            case 1:
                return '#e5e7eb';
            case 2:
                return '#fdba74';
            default:
                return '#f3f4f6';
        }
    }};
    
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

    &:hover 
    {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        
        background-color: ${props => 
        {
            switch (props.$rankIndex)
            {
                case 0:
                    return '#fef08a';
                case 1:
                    return '#e5e7eb';
                case 2:
                    return '#fed7aa';
                default:
                    return '#f9fafb';
            }
        }};
    }

    @media ${device.tablet}
    {
        grid-template-columns: 40px 1.5fr 1fr 1fr 1fr;
        padding: 10px 12px;
        font-size: 0.9rem;
    }

    @media ${device.mobileL}
    {
        grid-template-columns: 35px 2fr 1fr 1fr; 
        
        .hide-on-mobile 
        {
            display: none;
        }
    }
`;

const RankIcon = styled.span`
    font-size: 1.5rem;
    font-weight: bold;
    color: #6b7280;
    text-align: center;

    @media ${device.mobileL}
    {
        font-size: 1.2rem;
    }
`;

const PlayerInfo = styled.span`
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
`;

const DisplayName = styled.span`
    font-weight: 700;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UsernameSubtitle = styled.span`
    font-size: 0.75rem;
    color: #313439;
`;

const StatText = styled.span`
    font-weight: 600;
    color: #313439;
    text-align: center;
`;

const HighlightedStat = styled(StatText)`
    color: #000000;
    font-weight: 700;
`;

// COMPONENT DEFINITION
const LeaderboardFullRow = ({ player, index }) =>
{
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const icon = getRankIcon(index);
    let name = `User #${player.user_id}`;
    
    if (player.display_name !== undefined && player.display_name !== null && player.display_name !== '')
        name = player.display_name;
    else if (player.username !== undefined && player.username !== null && player.username !== '')
        name = player.username;

    const username = player.username;
    const wins = player.wins || 0;
    const games = player.games || 0;
    
    let isCurrentUser = false;
    if (user !== undefined && user !== null && user.username === player.username)
        isCurrentUser = true;

    const handleRowClick = () => 
    {
        if (isCurrentUser) 
            navigate('/profile');
        else 
            setIsPopupOpen(true);
    };

    return (
        <>
            <RowContainer $rankIndex={index} onClick={handleRowClick}>
                
                <RankIcon>
                    {icon}
                </RankIcon>
                
                <PlayerInfo>
                    <DisplayName>
                        {name}
                    </DisplayName>
                    {username !== undefined && username !== null && username !== '' && 
                    (
                        <UsernameSubtitle>
                            @{username}
                        </UsernameSubtitle>
                    )}
                </PlayerInfo>
                
                <HighlightedStat>
                    {wins} W
                </HighlightedStat>
                
                <StatText className="hide-on-mobile">
                    {games} P
                </StatText>
                
                <HighlightedStat>
                    {calculateWinRate(wins, games)}
                </HighlightedStat>
                
            </RowContainer>

            {isCurrentUser === false && 
            (
                <PlayerInfoPopup 
                    isOpen={isPopupOpen} 
                    onClose={() => setIsPopupOpen(false)} 
                    username={player.username} 
                />
            )}
        </>
    );
};

export default LeaderboardFullRow;