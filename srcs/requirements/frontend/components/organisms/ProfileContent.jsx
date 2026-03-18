import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { getUserDetails, updateUserProfile } from '../../services/userService';
import { addFriend, getFriends } from '../../services/api';
import BadgeWidget from '../molecules/BadgeWidget';
import ProfileImage from '../atoms/ProfileImage';
import FriendListWidget from '../organisms/FriendListWidget';
import PerformanceStats from '../molecules/PerformanceStats';
import MatchHistoryTable from '../molecules/MatchHistoryTable';
import EditProfileModal from './EditProfileModal';
import '../../styles/ProfileContent.css';

const ProfileContent = ({ userDetails, stats, onLogout, onDeleteAccount, isOtherUser }) =>
{
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [friendAddStatus, setFriendAddStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error', 'already_friends'
    const [friendAddMessage, setFriendAddMessage] = useState('');
    const [isAlreadyFriends, setIsAlreadyFriends] = useState(false);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            try
            {
                // If viewing other user, userData is passed as prop
                if (isOtherUser && userDetails)
                {
                    setUserData(userDetails);
                    
                    // Check if already friends
                    try {
                        const friendsData = await getFriends();
                        const isFriend = friendsData?.friends?.some(f => f.username === userDetails.username);
                        setIsAlreadyFriends(isFriend || false);
                    } catch (error) {
                        console.error("Failed to check friend status:", error);
                    }
                    
                    setLoading(false);
                    return;
                }
                
                // Otherwise fetch current user's details
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
    }, [isOtherUser, userDetails]);

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

    const handleAddFriend = async () =>
    {
        try {
            setFriendAddStatus('loading');
            const result = await addFriend(userData?.username);
            
            setFriendAddMessage('Friend request sent successfully!');
            setFriendAddStatus('success');
            setIsAlreadyFriends(true);
            setTimeout(() => {
                setFriendAddStatus('idle');
                setFriendAddMessage('');
            }, 2000);
        } catch (error) {
            console.error('Error adding friend:', error);
            const errorMessage = error.message || 'Failed to add friend';
            
            // Check for specific error messages
            if (errorMessage.includes('already friends')) {
                setFriendAddMessage('You are already friends with this user');
                setIsAlreadyFriends(true);
            } else if (errorMessage.includes('pending')) {
                setFriendAddMessage('Friend request already pending');
                setFriendAddStatus('error');
            } else {
                setFriendAddMessage(errorMessage);
                setFriendAddStatus('error');
            }
            setTimeout(() => {
                setFriendAddStatus('idle');
                setFriendAddMessage('');
            }, 3000);
        }
    };

    if (loading) return <div className="o-dashboard-container">Loading...</div>;

    return (
        <div className="o-dashboard-container">
            <div className="o-profile-grid">
                <div className="profile-card-base m-profile-column">
                    <div className="a-profile-header">
                        <div onClick={() => !isOtherUser && setIsEditModalOpen(true)} style={{ cursor: isOtherUser ? 'default' : 'pointer' }}>
                            <ProfileImage src={userData?.avatar} style={{ width: '150px', height: '150px' }} />
                        </div>
                        <div className="profile-info-edit-area">
                            <h2 className="a-profile-name">{userData?.display_name || userData?.nickname || userData?.username}</h2>
                            <p className="a-profile-email">@{userData?.username}</p>
                        </div>
                    </div>
                    
                    <div className="profile-actions-wrapper">
                        {!isOtherUser && (
                            <>
                                <button className="green-btn outline" onClick={() => setIsEditModalOpen(true)}>Edit Profile</button>
                                <button className="green-btn danger-btn" onClick={onLogout}>Log Out</button>
                                <button className="text-btn-danger" onClick={onDeleteAccount}>Delete Account</button>
                            </>
                        )}
                        {isOtherUser && user && (
                            <>
                                {!isAlreadyFriends && (
                                    <button 
                                        className="green-btn outline"
                                        onClick={handleAddFriend}
                                        disabled={friendAddStatus === 'loading'}
                                    >
                                        {friendAddStatus === 'loading' ? 'Adding...' : 
                                         friendAddStatus === 'success' ? 'Added!' :
                                         friendAddStatus === 'error' ? 'Error' :
                                         'Add Friend'}
                                    </button>
                                )}
                                {isAlreadyFriends && (
                                    <p style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#dcfce7',
                                        color: '#166534',
                                        borderRadius: '6px',
                                        textAlign: 'center',
                                        fontWeight: '500'
                                    }}>
                                        ✓ Already Friends
                                    </p>
                                )}
                                {friendAddMessage && (
                                    <p style={{
                                        marginTop: '10px',
                                        fontSize: '0.9rem',
                                        color: friendAddStatus === 'success' ? '#16a34a' :
                                               '#dc2626',
                                        textAlign: 'center'
                                    }}>
                                        {friendAddMessage}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {!isOtherUser && (
                    <div className="profile-card-base m-friend-section">
                        <FriendListWidget />
                    </div>
                )}

                <div className="profile-card-base">
                    <BadgeWidget />
                </div>
            </div>

            <PerformanceStats username={userData?.username} />
            
            <div className="profile-card-base o-history-section">
                <MatchHistoryTable username={userData?.username} />
            </div>

            {!isOtherUser && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    currentUserData={userData}
                    onSave={handleSaveProfile}
                />
            )}
        </div>
    );
};

export default ProfileContent;