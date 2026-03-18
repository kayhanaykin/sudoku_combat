import React from 'react';

const getRankClass = (index) =>
{
  switch (index)
  {
    case 0:
        return 'rank-gold';
    case 1:
        return 'rank-silver';
    case 2:
        return 'rank-bronze';
    default:
        return 'rank-normal';
  }
};

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

const LeaderboardRow = ({ player, index }) =>
{
  const rankClass = getRankClass(index);
  const icon = getRankIcon(index);
  const displayName = player.display_name || player.username || `User #${player.user_id}`;
  const username = player.username;
  const wins = player.wins || 0;

  return (
    <div className={`player-row ${rankClass}`}>
      <span className="col-rank rank-icon" style={{ fontSize: '1rem' }}>
        {icon}
      </span>
      
      <span className="col-player" style={{ fontSize: '1rem' }}>
        <div>
          {displayName}
          {username && <span className="username-subtitle">@{username}</span>}
        </div>
      </span>

      <span className="col-wins" style={{ fontSize: '1rem', width: 'auto' }}>
        {wins} pts
      </span>
    </div>
  );
};

export default LeaderboardRow;