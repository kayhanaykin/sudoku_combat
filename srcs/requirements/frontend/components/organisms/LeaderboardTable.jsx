import React from 'react';
import LeaderboardFullRow from '../molecules/LeaderboardFullRow';

const LeaderboardTable = ({ players, loading, mode }) =>
{
  if (loading)
    return <div className="state-message">Loading rankings...</div>;

  return (
    <div className="leaderboard-list">
      <div className="header-row">
        <span className="col-rank">Rank</span>
        <span className="col-player">Player</span>
        <span className="col-wins">Wins</span>
        <span className="col-games">Games</span>
        <span className="col-rate">Win Rate</span>
      </div>

      {players.length > 0 ? (
        players.map((player, index) => (
          <LeaderboardFullRow 
            key={index} 
            player={player} 
            index={index} 
          />
        ))
      ) : (
        <div className="state-message">
          No records found for <strong>{mode}</strong> mode yet.
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;