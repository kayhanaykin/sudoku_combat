import React from 'react';
import { useNavigate } from 'react-router-dom';
import useLeaderboardPage from '../src/hooks/useLeaderboardPage';
import LeaderboardTabs from '../components/molecules/LeaderboardTabs';
import LeaderboardTable from '../components/organisms/LeaderboardTable';
import '../styles/Leaderboard.css';

const LeaderboardPage = () =>
{
  const navigate = useNavigate();
  const { mode, setMode, players, loading, modes } = useLeaderboardPage();

  return (
    <div className="leaderboard-page">
      <button onClick={() => navigate('/')} className="btn-back">
        ← Back to Game
      </button>

      <div className="leaderboard-card">
        <h1 className="leaderboard-title">🏆 Hall of Fame</h1>

        <LeaderboardTabs 
          modes={modes} 
          currentMode={mode} 
          onModeChange={setMode} 
        />

        <LeaderboardTable 
          players={players} 
          loading={loading} 
          mode={mode} 
        />
      </div>
    </div>
  );
};

export default LeaderboardPage;