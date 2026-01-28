import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import '../styles/Leaderboard.css';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('Total');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const modes = ['Total', 'Easy', 'Medium', 'Hard', 'Expert', 'Extreme'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try
      {
        const data = await getLeaderboard(mode);
        
        let validData = [];
        if (Array.isArray(data))
          validData = data;
        else if (data && Array.isArray(data.data))
          validData = data.data;

        const sorted = validData.sort((a, b) => (b.wins || 0) - (a.wins || 0));
        setPlayers(sorted);
      }
      catch (error)
      {
        console.error("Leaderboard Page Error:", error);
      } 
      finally
      {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode]);

  const getRankClass = (index) => {
    switch (index) {
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

  const getRankIcon = (index) => {
    switch (index) {
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

  const calculateWinRate = (wins, games) => {
    if (!games || games === 0)
      return "0.0%";
    const rate = (wins / games) * 100;
    return rate.toFixed(1) + "%";
  };

  return (
    <div className="leaderboard-page">
      <button onClick={() => navigate('/')} className="btn-back">
        ← Back to Game
      </button>

      <div className="leaderboard-card">
        <h1 className="leaderboard-title">🏆 Hall of Fame</h1>

        <div className="tab-container">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`tab-button ${mode === m ? 'active' : ''}`}
            >
              {m}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="state-message">Loading rankings...</div>
        ) : (
          <div className="leaderboard-list">
            <div className="header-row">
              <span className="col-rank">Rank</span>
              <span className="col-player">Player</span>
              <span className="col-wins">Wins</span>
              <span className="col-games">Games</span>
              <span className="col-rate">Win Rate</span>
            </div>

            {players.length > 0 ? (
              players.map((player, index) => {
                const rankClass = getRankClass(index);
                const icon = getRankIcon(index);
                const name = player.username || player.display_name || `User #${player.user_id}`;
                
                const wins = player.wins || 0;
                const games = player.games || 0;
                
                return (
                  <div key={index} className={`player-row ${rankClass}`}>
                    <span className="col-rank rank-icon">
                      {icon}
                    </span>
                    <span className="col-player">
                      {name}
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
                );
              })
            ) : (
              <div className="state-message">
                No records found for <strong>{mode}</strong> mode yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;