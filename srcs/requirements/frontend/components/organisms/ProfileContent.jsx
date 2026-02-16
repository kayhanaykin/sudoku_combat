import React, { useState, useEffect } from 'react';
import { getUserDetails, updateUserProfile } from '../../services/userService';
import BadgeWidget from '../molecules/BadgeWidget';
import ProfileImage from '../atoms/ProfileImage';
import FriendListWidget from '../organisms/FriendListWidget';
import PerformanceStats from '../molecules/PerformanceStats'; // Yeni bileşeni ekledik
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
                if (data) setUserData(data);
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

    const handleSaveProfile = async (formData) =>
    {
        try
        {
            const result = await updateUserProfile(formData);
            if (result && result.user)
            {
                setUserData({
                    ...userData,
                    nickname: result.user.display_name || result.user.username,
                    email: result.user.email,
                    avatar: result.user.avatar ? `${result.user.avatar}?t=${new Date().getTime()}` : userData.avatar
                });
                setIsEditModalOpen(false);
            }
        }
        catch (error)
        {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) return <div className="o-dashboard-container">Loading...</div>;

    return (
        <div className="o-dashboard-container">
            <div className="o-profile-grid">
                <div className="profile-card-base m-profile-column">
                    <div className="a-profile-header">
                        <div onClick={() => setIsEditModalOpen(true)} style={{ cursor: 'pointer' }}>
                            <ProfileImage src={userData?.avatar} style={{ width: '150px', height: '150px' }} />
                        </div>
                        <div className="profile-info-edit-area">
                            <h2 className="a-profile-name">{userData?.display_name || userData?.nickname}</h2>
                            <p className="a-profile-email">@{userData?.username}</p>
                        </div>
                    </div>
                    
                    <div className="profile-actions-wrapper">
                        <button className="green-btn outline" onClick={() => setIsEditModalOpen(true)}>Edit Profile</button>
                        <button className="green-btn danger-btn" onClick={onLogout}>Log Out</button>
                        <button className="text-btn-danger" onClick={onDeleteAccount}>Delete Account</button>
                    </div>
                </div>

                <div className="profile-card-base m-friend-section">
                    <FriendListWidget />
                </div>

                <div className="profile-card-base">
                    <BadgeWidget />
                </div>
            </div>

            {/* Ayrı bir bileşen olarak buraya ekledik */}
            <PerformanceStats stats={stats} />

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