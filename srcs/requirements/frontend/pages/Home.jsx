import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/molecules/Navbar';
import Leaderboard from '../components/organisms/Leaderboard';
import DifficultyModal from '../components/organisms/DifficultyModal';
import { startGame } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);

  const handlePlayClick = (mode) => {
    setSelectedMode(mode);
    setIsDifficultyOpen(true);
  };

  const handleDifficultySelect = async (difficulty) => {
    setIsDifficultyOpen(false);
    try
    {
      const gameData = await startGame(selectedMode, difficulty);
      if (selectedMode === 'offline')
        navigate('/offline-game', { state: { gameData, difficulty } });
      else
        navigate('/online-game', { state: { gameData, difficulty } });
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Could not start the game. Check console.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="hero-section">
        <div className="dashboard-container">
          
          <div className="actions-column">
            
            <div className="mode-card online" onClick={() => handlePlayClick('online')}>
              <div className="icon-wrapper">⚔️</div>
              <div className="card-content">
                <h2>Play Online</h2>
                <p>Play with friends or random opponents</p>
              </div>
            </div>

            <div className="mode-card offline" onClick={() => handlePlayClick('offline')}>
              <div className="icon-wrapper">🗡️</div>
              <div className="card-content">
                <h2>Play Offline</h2>
                <p>Play solo to improve your skills</p>
              </div>
            </div>

          </div>

          <div className="leaderboard-wrapper">
             <Leaderboard />
          </div>

        </div>
      </main>

      <DifficultyModal 
        isOpen={isDifficultyOpen} 
        onClose={() => setIsDifficultyOpen(false)}
        onSelect={handleDifficultySelect}
      />
    </>
  );
};

export default Home;