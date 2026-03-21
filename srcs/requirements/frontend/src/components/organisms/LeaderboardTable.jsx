import React from 'react';
import styled from 'styled-components';
import LeaderboardFullRow from '../molecules/LeaderboardFullRow';

// STYLED COMPONENTS
const TableContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const HeaderRow = styled.div`
    display: flex;
    padding: 10px 20px;
    border-bottom: 2px solid #eee;

    span 
    {
        font-weight: 900;
        color: #000;
        font-size: 0.95rem;
    }
`;

const ColRank = styled.span`
    width: 50px; 
    text-align: center; 
`;

const ColPlayer = styled.span`
    flex: 1; 
    text-align: left; 
    padding-left: 25px; 
`;

const ColWins = styled.span`
    width: 100px; 
    text-align: center; 
`;

const ColGames = styled.span`
    width: 100px; 
    text-align: center; 
`;

const ColRate = styled.span`
    width: 100px;
    text-align: center;
`;

const StateMessage = styled.div`
    text-align: center;
    padding: 40px;
    color: #888;
`;

// COMPONENT DEFINITION
const LeaderboardTable = ({ players, loading, mode }) =>
{
    if (loading)
    {
        return (
            <StateMessage>
                Loading rankings...
            </StateMessage>
        );
    }

    let contentElement = null;

    if (players && players.length > 0)
    {
        contentElement = players.map((player, index) => (
            <LeaderboardFullRow 
                key={index} 
                player={player} 
                index={index} 
            />
        ));
    }
    else
    {
        contentElement = (
            <StateMessage>
                No records found for <strong>{mode}</strong> mode yet.
            </StateMessage>
        );
    }

    return (
        <TableContainer>
            
            <HeaderRow>
                <ColRank>Rank</ColRank>
                <ColPlayer>Player</ColPlayer>
                <ColWins>Wins</ColWins>
                <ColGames>Games</ColGames>
                <ColRate>Win Rate</ColRate>
            </HeaderRow>

            {contentElement}
            
        </TableContainer>
    );
};

export default LeaderboardTable;