import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/molecules/Navbar';
import Leaderboard from '../components/organisms/Leaderboard';
import DifficultyModal from '../components/organisms/DifficultyModal';
import OnlineGameModal from '../components/molecules/OnlineGamePopup';
import { startGame, createRoom, joinRoom } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const user = { id: "101" };

  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlayClick = (mode) => {
    if (mode === 'online') {
      setIsOnlineModalOpen(true);
    } else {
      setIsDifficultyOpen(true);
    }
  };

  // --- ONLINE: ODA OLUŞTURMA ---
  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const data = await createRoom(user.id);
      console.log("Room Created:", data);

      navigate('/online-game', { state: { roomId: data.roomId, role: 'owner' } });
      
    } catch (err) {
      alert("Error creating room: " + err.message);
    } finally {
      setLoading(false);
      setIsOnlineModalOpen(false);
    }
  };

  // --- ONLINE: ODAYA KATILMA ---
  const handleJoinRoom = async (roomId) => {
    setLoading(true);
    try {
      const data = await joinRoom(roomId, user.id);
      console.log("Room Joined:", data);

      navigate('/online-game', { state: { roomId: data.roomId, role: 'guest' } });

    } catch (err) {
      alert("Error joining room: " + err.message);
    } finally {
      setLoading(false);
      setIsOnlineModalOpen(false);
    }
  };

  // --- OFFLINE: ZORLUK SEÇME ---
  const handleDifficultySelect = async (difficulty) => {
    setIsDifficultyOpen(false);
    try {
      const gameData = await startGame('offline', difficulty);
      navigate('/offline-game', { state: { gameData, difficulty } });
    } catch (error) {
      console.error(error);
      alert("Error starting offline game.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="hero-section">
        <div className="dashboard-container">
          
          <div className="actions-column">
            
            {/* ONLINE BUTONU */}
            <div className="mode-card online" onClick={() => handlePlayClick('online')}>
              <div className="icon-wrapper">⚔️</div>
              <div className="card-content">
                <h2>Play Online</h2>
                <p>Play with friends or random opponents</p>
              </div>
            </div>

            {/* OFFLINE BUTONU */}
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

      {/* OFFLINE MODAL */}
      <DifficultyModal 
        isOpen={isDifficultyOpen} 
        onClose={() => setIsDifficultyOpen(false)}
        onSelect={handleDifficultySelect}
      />

      {/* ONLINE MODAL */}
      <OnlineGameModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        onCreate={handleCreateRoom}
        onJoin={handleJoinRoom}
        isLoading={loading}
      />
    </>
  );
};

export default Home;