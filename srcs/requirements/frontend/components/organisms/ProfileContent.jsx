import React, { useState, useEffect } from 'react';
import { getUserDetails, updateUserProfile } from '../../services/userService';
import BadgeWidget from '../molecules/BadgeWidget';
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
            try
            {
                const data = await getUserDetails();
                if (data)
                {
                    setUserData(data);
                }
            }
            catch (error)
            {
                console.error("Failed to load profile data", error);
            }
            finally
            {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // GÜNCELLENMİŞ KAYIT FONKSİYONU
    const handleSaveProfile = async (formData) =>
    {
        try
        {
            // Modal'dan gelen FormData'yı direkt servise yolluyoruz
            const result = await updateUserProfile(formData);

            if (result && result.user)
            {
                // Dönen veriyi formatla
                const updatedUser = {
                    ...userData, // Eski verileri koru
                    nickname: result.user.display_name || result.user.username, // Yeni ismi işle
                    email: result.user.email,
                    // Avatar URL'ini güncelle (Timestamp ile cache-busting)
                    avatar: result.user.avatar 
                        ? `${result.user.avatar}?t=${new Date().getTime()}`
                        : userData.avatar
                };

                setUserData(updatedUser);
                setIsEditModalOpen(false); // Modalı kapat
            }
        }
        catch (error)
        {
            console.error("Profile update failed:", error);
            alert(`Error: ${error.message}`);
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
    {
        return <div className="o-dashboard-container">Loading...</div>;
    }

    return (
        <div className="o-dashboard-container">
            <div className="o-profile-grid">

                <div className="profile-card-base m-profile-column">
                    <div className="a-profile-header">
                        <div
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            <ProfileImage
                                src={userData?.avatar}
                                style={{ width: '150px', height: '150px' }}
                            />
                        </div>

                        <div className="profile-info-edit-area">
                            <h2 className="a-profile-name">
                                {/* display_name yoksa nickname göster, o da yoksa boş */}
                                {userData?.display_name || userData?.nickname}
                            </h2>
                            <p className="a-profile-email">
                                @{userData?.username}
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                        <button className="green-btn outline" onClick={() => setIsEditModalOpen(true)}>
                            Edit Profile
                        </button>
                        <button className="green-btn danger-btn" onClick={onLogout}>
                            Log Out
                        </button>
                        <button className="text-btn-danger" onClick={onDeleteAccount}>
                            Delete Account
                        </button>
                    </div>
                </div>

                <div className="profile-card-base m-friend-section">
                    <FriendListWidget />
                </div>

                <div className="profile-card-base">
                    <BadgeWidget />
                </div>

            </div>

            {/* İstatistik Tablosu */}
            <div className="profile-card-base o-stats-section">
                <h3 className="section-title">
                    Performance Statistics
                </h3>
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

            {/* Modal */}
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