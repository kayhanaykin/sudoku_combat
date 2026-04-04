import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';

import termsContent from './docs/terms_of_services.md?raw';
import privacyContent from './docs/privacy_policy.md?raw';

import Home from './pages/Home';
import OnlineGame from './pages/Online-Game';
import OfflineGame from './pages/Offline-Game';
import LeaderboardPage from './pages/LeaderboardPage';
import Profile from './pages/Profile';
import DebugUsersPage from './pages/DebugUsersPage';
import PolicyPopup from './components/molecules/PolicyPopup';
import PolicyPage from './pages/PolicyPage';

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <WebSocketProvider>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/online-game/:roomId" element={<OnlineGame />} />
                        <Route path="/offline-game" element={<OfflineGame />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/profile/:username" element={<Profile />} />
                        <Route path="/debug-users" element={<DebugUsersPage />} />
                        <Route path="/terms-of-service" element={<PolicyPage content={termsContent} />} />
                        <Route path="/privacy-policy" element={<PolicyPage content={privacyContent} />} />
                    </Routes>
                    <PolicyPopup />
                </WebSocketProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;