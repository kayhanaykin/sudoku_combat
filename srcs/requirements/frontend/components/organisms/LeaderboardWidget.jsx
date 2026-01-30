import React from 'react';
import { useNavigate } from 'react-router-dom';
import useLeaderboardWidget from '../../src/hooks/useLeaderboardWidget';
import LeaderboardRow from '../molecules/LeaderboardRow';
import '../../styles/Leaderboard.css';

const LeaderboardWidget = () =>
{
  const navigate = useNavigate();
  const { players, loading } = useLeaderboardWidget();

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
          players.map((player, index) => (
            <LeaderboardRow 
              key={index} 
              player={player} 
              index={index} 
            />
          ))
        ) : (
          <div className="state-message" style={{ padding: '10px' }}>
            No records yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardWidget;