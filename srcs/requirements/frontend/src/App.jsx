import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from '../pages/Home';
import OnlineGame from '../pages/Online-Game';
import OfflineGame from '../pages/Offline-Game';
import LeaderboardPage from '../pages/LeaderboardPage';  

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/online-game" element={<OnlineGame />} />
        <Route path="/offline-game" element={<OfflineGame />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;