// src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/molecules/Navbar';
import Leaderboard from '../components/molecules/Leaderboard';

const Home = () => {
  return (
    <>
      {/* Navbar en üstte */}
      <Navbar />

      {/* Ana içerik */}
      <main className="hero-section">
        <div className="dashboard-container">
          
          {/* SOL KOLON: Oyun Modları */}
          <div className="actions-column">
            
            <div className="mode-card" onClick={() => console.log('Online')}>
              <span className="icon">⚔️</span>
              <div className="card-content">
                <h2>Play Online</h2>
                <p>Play with friends or random opponents</p>
              </div>
            </div>

            <div className="mode-card" onClick={() => console.log('Offline')}>
              <span className="icon">🗡️</span>
              <div className="card-content">
                <h2>Play Offline</h2>
                <p>Play AI or Local Multiplayer</p>
              </div>
            </div>

          </div>

          {/* SAĞ KOLON: Leaderboard Bileşeni */}
          <Leaderboard />

        </div>
      </main>
    </>
  );
};

export default Home;