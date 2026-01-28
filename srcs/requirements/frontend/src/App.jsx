import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import Home from '../pages/Home';
import OnlineGame from '../pages/Online-Game';
import OfflineGame from '../pages/Offline-Game';
import LeaderboardPage from '../pages/LeaderboardPage';
import Profile from '../pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/online-game" element={<OnlineGame />} />
          <Route path="/offline-game" element={<OfflineGame />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;