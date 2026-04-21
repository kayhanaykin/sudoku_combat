import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading)
        return null;
    if (!user)
        return <Navigate to="/" replace />;
    return children;
};
import { WebSocketProvider } from './context/WebSocketContext';

import termsContent from './docs/terms_of_services.md?raw';
import privacyContent from './docs/privacy_policy.md?raw';

import Home from './pages/Home';
import OnlineGame from './pages/OnlineGame';
import OfflineGame from './pages/OfflineGame';
import LeaderboardPage from './pages/LeaderboardPage';
import Profile from './pages/Profile';
import DebugUsersPage from './pages/DebugUsersPage';

import PolicyPage from './pages/PolicyPage';
import NotFound from './pages/NotFound';

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
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/debug-users" element={<DebugUsersPage />} />
                        <Route path="/terms-of-service" element={<PolicyPage content={termsContent} />} />
                        <Route path="/privacy-policy" element={<PolicyPage content={privacyContent} />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>

                </WebSocketProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;