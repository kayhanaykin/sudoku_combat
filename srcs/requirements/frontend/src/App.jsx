import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';

import Home from '../pages/Home';
import OnlineGame from '../pages/Online-Game';
import OfflineGame from '../pages/Offline-Game';
import LeaderboardPage from '../pages/LeaderboardPage';
import Profile from '../pages/Profile';

function App()
{
  return (
    // Router'ı EN DIŞA alıyoruz. Standart ve en sağlıklı yapı budur.
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/online-game" element={<OnlineGame />} />
            <Route path="/offline-game" element={<OfflineGame />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;