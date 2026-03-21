import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { getUserDetails, updateUserProfile } from '../../services/userService';
import { addFriend, getFriends } from '../../services/api';
import BadgeWidget from '../molecules/BadgeWidget';
import ProfileImage from '../atoms/ProfileImage';
import FriendListWidget from '../organisms/FriendListWidget';
import PerformanceStats from '../molecules/PerformanceStats';
import MatchHistoryTable from '../molecules/MatchHistoryTable';
import EditProfileModal from '../molecules/EditProfileModal';

// STYLED COMPONENTS
const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 25px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
`;

const ProfileGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr); 
    gap: 20px;
    width: 100%;
    align-items: stretch;

    @media (max-width: 1024px)
    {
        grid-template-columns: 1fr;
    }
`;

const BaseCard = styled.div`
    width: 100%;
    height: 450px;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 20px;
    box-sizing: border-box;

    @media (max-width: 1024px)
    {
        height: auto;
        min-height: 400px;
    }
`;

const ProfileHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
`;

const ImageWrapper = styled.div`
    cursor: ${props => 
    {
        if (props.$isOtherUser)
            return 'default';
            
        return 'pointer';
    }};
`;

const StyledProfileImage = styled(ProfileImage)`
    width: 150px !important;
    height: 150px !important;
`;

const InfoEditArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    align-items: center;
    margin-bottom: 20px;
`;

const ProfileName = styled.h2`
    margin: 0;
`;

const ProfileEmail = styled.p`
    margin: 0;
    color: #666;
`;

const ActionsWrapper = styled.div`
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

const BaseBtn = styled.button`
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
    text-align: center;
    font-weight: bold;
    border: none;
`;

const GreenOutlineBtn = styled(BaseBtn)`
    background: transparent;
    color: #10b981;
    border: 2px solid #10b981;

    &:hover:not(:disabled)
    {
        background-color: #f0fdf4;
    }

    &:disabled
    {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const DangerBtn = styled(BaseBtn)`
    background-color: #ef4444;
    color: white;

    &:hover
    {
        background-color: #dc2626;
    }
`;

const TextDangerBtn = styled(BaseBtn)`
    background: transparent;
    color: #dc2626;
    border: 1px solid #fee2e2;

    &:hover
    {
        background-color: #fef2f2;
        border-color: #dc2626;
    }
`;

const StatusMessage = styled.p`
    margin-top: 10px;
    font-size: 0.9rem;
    text-align: center;
    
    color: ${props => 
    {
        if (props.$type === 'success')
            return '#16a34a';
            
        return '#dc2626';
    }};
`;

const AlreadyFriendsText = styled.p`
    padding: 10px 20px;
    background-color: #dcfce7;
    color: #166534;
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
    margin: 0;
`;

// COMPONENT DEFINITION
const ProfileContent = ({ userDetails, stats, onLogout, onDeleteAccount, isOtherUser }) =>
{
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [friendAddStatus, setFriendAddStatus] = useState('idle'); 
    const [friendAddMessage, setFriendAddMessage] = useState('');
    const [isAlreadyFriends, setIsAlreadyFriends] = useState(false);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            try
            {
                if (isOtherUser && userDetails)
                {
                    setUserData(userDetails);
                    
                    try 
                    {
                        const friendsData = await getFriends();
                        let isFriend = false;
                        
                        if (friendsData && friendsData.friends)
                        {
                            const found = friendsData.friends.some(f => f.username === userDetails.username);
                            if (found)
                                isFriend = true;
                        }
                        
                        setIsAlreadyFriends(isFriend);
                    } 
                    catch (error) 
                    {
                        console.error("Failed to check friend status:", error);
                    }
                    
                    setLoading(false);
                    return;
                }
                
                const data = await getUserDetails();
                if (data) 
                    setUserData(data);
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
                let newNickname = result.user.username;
                if (result.user.display_name)
                    newNickname = result.user.display_name;

                let newAvatar = userData.avatar;
                if (result.user.avatar)
                    newAvatar = `${result.user.avatar}?t=${new Date().getTime()}`;

                setUserData({
                    ...userData,
                    nickname: newNickname,
                    email: result.user.email,
                    avatar: newAvatar
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
        try 
        {
            setFriendAddStatus('loading');
            await addFriend(userData?.username);
            
            setFriendAddMessage('Friend request sent successfully!');
            setFriendAddStatus('success');
            setIsAlreadyFriends(true);
            
            setTimeout(() => 
            {
                setFriendAddStatus('idle');
                setFriendAddMessage('');
            }, 2000);
        } 
        catch (error) 
        {
            console.error('Error adding friend:', error);
            
            let errorMessage = 'Failed to add friend';
            if (error.message)
                errorMessage = error.message;
            
            if (errorMessage.includes('already friends')) 
            {
                setFriendAddMessage('You are already friends with this user');
                setIsAlreadyFriends(true);
            } 
            else if (errorMessage.includes('pending')) 
            {
                setFriendAddMessage('Friend request already pending');
                setFriendAddStatus('error');
            } 
            else 
            {
                setFriendAddMessage(errorMessage);
                setFriendAddStatus('error');
            }
            
            setTimeout(() => 
            {
                setFriendAddStatus('idle');
                setFriendAddMessage('');
            }, 3000);
        }
    };

    if (loading) 
        return <DashboardContainer>Loading...</DashboardContainer>;

    let displayName = 'User';
    if (userData)
    {
        if (userData.display_name)
            displayName = userData.display_name;
        else if (userData.nickname)
            displayName = userData.nickname;
        else if (userData.username)
            displayName = userData.username;
    }

    let currentUsername = '';
    if (userData && userData.username)
        currentUsername = userData.username;

    let currentAvatar = null;
    if (userData && userData.avatar)
        currentAvatar = userData.avatar;

    let actionsContent = null;
    
    if (!isOtherUser)
    {
        actionsContent = (
            <>
                <GreenOutlineBtn onClick={() => setIsEditModalOpen(true)}>
                    Edit Profile
                </GreenOutlineBtn>
                <DangerBtn onClick={onLogout}>
                    Log Out
                </DangerBtn>
                <TextDangerBtn onClick={onDeleteAccount}>
                    Delete Account
                </TextDangerBtn>
            </>
        );
    }
    else if (user)
    {
        let friendActionBtn = null;
        
        if (isAlreadyFriends)
        {
            friendActionBtn = (
                <AlreadyFriendsText>
                    ✓ Already Friends
                </AlreadyFriendsText>
            );
        }
        else
        {
            let addBtnText = 'Add Friend';
            if (friendAddStatus === 'loading')
                addBtnText = 'Adding...';
            else if (friendAddStatus === 'success')
                addBtnText = 'Added!';
            else if (friendAddStatus === 'error')
                addBtnText = 'Error';

            friendActionBtn = (
                <GreenOutlineBtn 
                    onClick={handleAddFriend}
                    disabled={friendAddStatus === 'loading'}
                >
                    {addBtnText}
                </GreenOutlineBtn>
            );
        }

        let friendMessageEl = null;
        if (friendAddMessage)
        {
            let msgType = 'error';
            if (friendAddStatus === 'success')
                msgType = 'success';

            friendMessageEl = (
                <StatusMessage $type={msgType}>
                    {friendAddMessage}
                </StatusMessage>
            );
        }

        actionsContent = (
            <>
                {friendActionBtn}
                {friendMessageEl}
            </>
        );
    }

    let friendsSection = null;
    if (!isOtherUser)
    {
        friendsSection = (
            <BaseCard>
                <FriendListWidget />
            </BaseCard>
        );
    }

    let editModalSection = null;
    if (!isOtherUser)
    {
        editModalSection = (
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUserData={userData}
                onSave={handleSaveProfile}
            />
        );
    }

    return (
        <DashboardContainer>
            
            <ProfileGrid>
                
                <BaseCard>
                    <ProfileHeader>
                        <ImageWrapper 
                            $isOtherUser={isOtherUser}
                            onClick={() => 
                            {
                                if (!isOtherUser)
                                    setIsEditModalOpen(true);
                            }}
                        >
                            <StyledProfileImage src={currentAvatar} />
                        </ImageWrapper>
                        <InfoEditArea>
                            <ProfileName>{displayName}</ProfileName>
                            <ProfileEmail>@{currentUsername}</ProfileEmail>
                        </InfoEditArea>
                    </ProfileHeader>
                    
                    <ActionsWrapper>
                        {actionsContent}
                    </ActionsWrapper>
                </BaseCard>

                {friendsSection}

                <BaseCard>
                    <BadgeWidget />
                </BaseCard>
                
            </ProfileGrid>

            <PerformanceStats username={currentUsername} />
            
            <BaseCard>
                <MatchHistoryTable username={currentUsername} />
            </BaseCard>

            {editModalSection}
            
        </DashboardContainer>
    );
};

export default ProfileContent;