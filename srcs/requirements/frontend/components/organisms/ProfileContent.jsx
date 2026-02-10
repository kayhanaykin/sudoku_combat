import React, { useState, useEffect } from 'react';
import { getUserDetails, updateUserAvatar } from '../../services/userService';
import { API_BASE_URL, getCookie } from '../../services/api';
import BadgeWidget from '../molecules/BadgeWidget';
import InfoBadge from '../atoms/InfoBadge';
import ProfileImage from '../atoms/ProfileImage';
import FriendListWidget from '../organisms/FriendListWidget';
import EditProfileModal from './EditProfileModal';
import '../../styles/ProfileContent.css';

const ProfileContent = ({ stats, onLogout, onDeleteAccount }) => 
{
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => 
    {
        const loadData = async () => 
        {
            const data = await getUserDetails();
            if (data)
                setUserData(data);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleSaveProfile = async (newNickname, newAvatarFile) => 
    {
        try
        {
            if (newNickname && newNickname !== userData.nickname)
            {
                const url = `${API_BASE_URL}/api/user/profile/edit/`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify({ display_name: newNickname })
                });

                if (response.ok)
                    setUserData(prev => ({ ...prev, nickname: newNickname }));
            }

            if (newAvatarFile)
            {
                const result = await updateUserAvatar(newAvatarFile);
                if (result.success)
                {
                    const timestamp = new Date().getTime();
                    const freshAvatarUrl = `${result.avatar}?t=${timestamp}`;
                    setUserData(prev => ({ ...prev, avatar: freshAvatarUrl }));
                }
            }
            setIsEditModalOpen(false);
        }
        catch (error)
        {
            console.error("Profile update failed:", error);
            alert("An error occurred while updating profile.");
        }
    };

    const difficulties = ['Easy', 'Medium', 'Hard', 'Expert', 'Extreme'];
    const detailedStats = difficulties.map(diff => 
    {
        const played = stats?.ranks?.[diff.toLowerCase()]?.played || 0;
        const won = stats?.ranks?.[diff.toLowerCase()]?.won || 0;
        const bestTime = stats?.ranks?.[diff.toLowerCase()]?.bestTime || '-';
        const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
        return { name: diff, played, won, winRate, bestTime };
    });

    const totalPlayed = detailedStats.reduce((acc, curr) => acc + curr.played, 0);
    const totalWon = detailedStats.reduce((acc, curr) => acc + curr.won, 0);
    const totalWinRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

    if (loading)
        return <div className="o-dashboard-container">Loading...</div>;

    return (
        <div className="o-dashboard-container">
            <div className="o-profile-grid">
                
                {/* COLUMN 1: PROFILE INFO */}
                <div className="profile-card-base m-profile-column">
                    <div className="a-profile-header">
                        <div 
                            onClick={() => setIsEditModalOpen(true)} 
                            title="Edit Profile"
                            style={{ cursor: 'pointer' }}
                        >
                            <ProfileImage 
                                src={userData?.avatar} 
                                style={{ width: '150px', height: '150px' }} 
                            />
                        </div>
                        
                        <div className="profile-info-edit-area">
                            <h2 className="a-profile-name">{userData?.nickname}</h2>
                            <p className="a-profile-email">@{userData?.username}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                        <button className="green-btn outline" onClick={() => setIsEditModalOpen(true)}>
                            Edit Profile
                        </button>
                        <button className="green-btn danger-btn" onClick={onLogout}>Log Out</button>
                        <button className="text-btn-danger" onClick={onDeleteAccount}>Delete Account</button>
                    </div>
                </div>

                {/* COLUMN 2: FRIEND LIST (UPDATED) */}
                <div className="profile-card-base m-friend-section">
                    <FriendListWidget />
                </div>

                {/* COLUMN 3: BADGES */}
                <div className="profile-card-base">
                    <BadgeWidget />
                </div>

            </div>

            <div className="profile-card-base o-stats-section">
                <h3 className="section-title">Performance Statistics</h3>
                <div className="stats-table-wrapper">
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th>Difficulty</th>
                                <th>Games Played</th>
                                <th>Won</th>
                                <th>Win Rate</th>
                                <th>Best Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedStats.map((row) => (
                                <tr key={row.name}>
                                    <td className="diff-cell">
                                        <span className={`diff-dot ${row.name.toLowerCase()}`}></span>
                                        {row.name}
                                    </td>
                                    <td>{row.played}</td>
                                    <td>{row.won}</td>
                                    <td>
                                        <div className="win-rate-bar-container">
                                            <span style={{width: '40px'}}>{row.winRate}%</span>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${row.winRate}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{row.bestTime}</td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td><strong>TOTAL</strong></td>
                                <td><strong>{totalPlayed}</strong></td>
                                <td><strong>{totalWon}</strong></td>
                                <td>
                                    <div className="win-rate-bar-container">
                                        <span style={{width: '40px'}}>{totalWinRate}%</span>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${totalWinRate}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUserData={userData}
                onSave={handleSaveProfile}
            />

        </div>
    );
};

export default ProfileContent;