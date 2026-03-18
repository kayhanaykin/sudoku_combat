import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import PlayerInfoPopup from './PlayerInfoPopup';

const getRankClass = (index) =>
{
  switch (index)
  {
    case 0: return 'rank-gold';
    case 1: return 'rank-silver';
    case 2: return 'rank-bronze';
    default: return 'rank-normal';
  }
};

const getRankIcon = (index) =>
{
  switch (index)
  {
    case 0: return '🥇';
    case 1: return '🥈';
    case 2: return '🥉';
    default: return `#${index + 1}`;
  }
};

const calculateWinRate = (wins, games) =>
{
  if (!games || games === 0)
    return "0.0%";
  const rate = (wins / games) * 100;
  return rate.toFixed(1) + "%";
};

const LeaderboardFullRow = ({ player, index }) =>
{
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const rankClass = getRankClass(index);
  const icon = getRankIcon(index);
  const name = player.display_name || player.username || `User #${player.user_id}`;
  const username = player.username;
  const wins = player.wins || 0;
  const games = player.games || 0;
  
  const isCurrentUser = user?.username === player.username;

  const handleRowClick = () => {
    if (isCurrentUser) {
      navigate('/profile');
    } else {
      setIsPopupOpen(true);
    }
  };

  return (
    <>
      <div className={`player-row ${rankClass}`} onClick={handleRowClick} style={{ cursor: 'pointer' }}>
        <span className="col-rank rank-icon">
          {icon}
        </span>
        <span className="col-player">
          {name}
          {username && <span className="username-subtitle">@{username}</span>}
        </span>
        <span className="col-wins">
          {wins}
        </span>
        <span className="col-games">
          {games} played
        </span>
        <span className="col-rate">
          {calculateWinRate(wins, games)}
        </span>
      </div>

      {!isCurrentUser && (
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