import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useLeaderboardWidget from '../../hooks/useLeaderboardWidget';
import LeaderboardRow from '../molecules/LeaderboardRow';

// STYLED COMPONENTS
const WidgetContainer = styled.div`
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    padding: 1.5rem;
    width: 100%;
    max-width: 400px;
    height: fit-content;
    border: 1px solid #eaeaea;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    box-sizing: border-box;

    &:hover
    {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    }
`;

const WidgetHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #f0f2f5;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
`;

const WidgetTitle = styled.h3`
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
`;

const ViewAllLink = styled.span`
    font-size: 0.85rem;
    color: #666;
    font-weight: 600;
    transition: color 0.2s;

    ${WidgetContainer}:hover & 
    {
        color: #4CAF50;
    }
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const StateMessage = styled.div`
    text-align: center;
    padding: 10px;
    color: #888;
`;

// COMPONENT DEFINITION
const LeaderboardWidget = () =>
{
    const navigate = useNavigate();
    const { players, loading } = useLeaderboardWidget();


    if (loading)
    {
        return (
            <WidgetContainer>
                <StateMessage>
                    Loading...
                </StateMessage>
            </WidgetContainer>
        );
    }

    let listContent = null;
    if (players && players.length > 0)
    {
        listContent = players.map((player, index) => (
            <LeaderboardRow 
                key={index} 
                player={player} 
                index={index} 
            />
        ));
    }
    else
    {
        listContent = (
            <StateMessage>
                No records yet.
            </StateMessage>
        );
    }

    return (
        <WidgetContainer 
            onClick={() => navigate('/leaderboard')}
            title="Click to view full rankings"
        >
            
            <WidgetHeader>
                <WidgetTitle>
                    🏆 Leaderboard
                </WidgetTitle>
                <ViewAllLink>
                    View All →
                </ViewAllLink>
            </WidgetHeader>
            
            <ListContainer>
                {listContent}
            </ListContainer>
            
        </WidgetContainer>
    );
};

export default LeaderboardWidget;