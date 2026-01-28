import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../../services/api';
import '../../styles/Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try
      {
        if (!getLeaderboard)
          return;
        const data = await getLeaderboard('Total');
        
        let validData = [];
        if (Array.isArray(data))
          validData = data;
        else if (data && Array.isArray(data.data))
          validData = data.data;

        const sorted = [...validData].sort((a, b) => (b.wins || 0) - (a.wins || 0));
        setPlayers(sorted.slice(0, 5));
      }
      catch (err)
      {
        console.error(err);
      }
      finally
      {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

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

  if (loading)
    return <div className="leaderboard-widget state-message">Loading...</div>;

  return (
    <div 
      className="leaderboard-widget" 
      onClick={() => navigate('/leaderboard')}
      title="Click to view full rankings"
    >
      <div className="widget-header">
        <h3 className="widget-title">🏆 Leaderboard</h3>
        <span className="view-all-link">View All →</span>
      </div>
      
      <div className="leaderboard-list">
        {players.length > 0 ? (
          players.map((player, index) => {
            const rankClass = getRankClass(index);
            const icon = getRankIcon(index);
            const displayName = player.username || player.display_name || `User #${player.user_id}`;
            const wins = player.wins || 0;
            
            return (
              <div key={index} className={`player-row ${rankClass}`}>
                <span className="col-rank rank-icon" style={{fontSize: '1rem'}}>
                  {icon}
                </span>
                
                <span className="col-player" style={{fontSize: '1rem'}}>
                  {displayName}
                </span>

                <span className="col-wins" style={{fontSize: '1rem', width: 'auto'}}>
                  {wins} pts
                </span>
              </div>
            );
          })
        ) : (
          <div className="state-message" style={{padding: '10px'}}>
            No records yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;