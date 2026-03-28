import React from 'react';
import styled from 'styled-components';
import LeaderboardFullRow from '../molecules/LeaderboardFullRow';
import { useAuth } from '../../context/AuthContext';
import { device } from '../../utils/device';

// STYLED COMPONENTS
const TableContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: 60px minmax(180px, 2fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(90px, 1fr);
    align-items: center;
    column-gap: 10px;
    padding: 12px 16px;
    border-bottom: 2px solid #eee;
    margin-bottom: 4px;

    span 
    {
        font-weight: 900;
        color: #000;
        font-size: 0.95rem;
    }

    @media ${device.mobileL}
    {
        grid-template-columns: 45px minmax(130px, 2fr) minmax(75px, 1fr) minmax(75px, 1fr);

        .hide-on-mobile
        {
            display: none;
        }
    }
`;

const ColRank = styled.span`
    text-align: center; 
`;

const ColPlayer = styled.span`
    text-align: left; 
    padding-left: 10px; 
`;

const ColWins = styled.span`
    text-align: center; 
`;

const ColGames = styled.span`
    text-align: center; 
`;

const ColRate = styled.span`
    text-align: center;
`;

const StateMessage = styled.div`
    text-align: center;
    padding: 40px;
    color: #888;
`;

const EllipsisRow = styled.div`
    display: grid;
    grid-template-columns: 60px minmax(180px, 2fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(90px, 1fr);
    column-gap: 10px;
    align-items: center;
    width: 100%;
    min-height: 56px;
    margin: 8px 0 10px 0;

    @media ${device.mobileL}
    {
        grid-template-columns: 45px minmax(130px, 2fr) minmax(75px, 1fr) minmax(75px, 1fr);

        .hide-on-mobile
        {
            display: none;
        }
    }
`;

const EllipsisCell = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
`;

// COMPONENT DEFINITION
const LeaderboardTable = ({ players, loading, mode }) =>
{
    const { user } = useAuth();

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
        const topFifty = players.slice(0, 50);
        const currentUserIndex = players.findIndex(p => p.username === user?.username);
        const currentUserOutsideTopFifty = currentUserIndex >= 50;

        const rows = topFifty.map((player, index) => (
            <LeaderboardFullRow 
                key={`${player.username || player.user_id}-${index}`} 
                player={player} 
                index={index}
                rank={index}
                highlight={player.username === user?.username}
            />
        ));

        if (currentUserOutsideTopFifty)
        {
            rows.push(
                <EllipsisRow key="ellipsis">
                    <EllipsisCell>⋮</EllipsisCell>
                    <EllipsisCell>⋮</EllipsisCell>
                    <EllipsisCell>⋮</EllipsisCell>
                    <EllipsisCell>⋮</EllipsisCell>
                    <EllipsisCell className="hide-on-mobile">⋮</EllipsisCell>
                </EllipsisRow>
            );

            const me = players[currentUserIndex];
            rows.push(
                <LeaderboardFullRow
                    key={`self-${me.username || me.user_id}`}
                    player={me}
                    index={currentUserIndex}
                    rank={currentUserIndex}
                    highlight={true}
                />
            );
        }

        contentElement = rows;
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
                <ColGames>Pts</ColGames>
                <ColRate className="hide-on-mobile">Win Rate</ColRate>
            </HeaderRow>

            {contentElement}
            
        </TableContainer>
    );
};

export default LeaderboardTable;