import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import ProfileContent from '../components/organisms/ProfileContent';
import ConfirmationModal from '../components/organisms/ConfirmationModal';
import { getUserDetails, getUserStats, logoutUser, deleteUserAccount } from '../services/api';
import '../styles/Profile.css';

const Profile = () =>
{
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { username: paramUsername } = useParams();

  const [userDetails, setUserDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOtherUser, setIsOtherUser] = useState(false);
  const [error, setError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleLogout = async () =>
  {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    try
    {
      await logoutUser();
    }
    catch (error)
    {
      console.error(error);
    }
    finally
    {
      logout();
      navigate('/');
    }
  };

  const handleDeleteRequest = () =>
  {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () =>
  {
    const success = await deleteUserAccount();

    if (success)
    {
      setIsDeleteModalOpen(false);
      alert("Your account has been successfully deleted.");
      logout();
      navigate('/');
    }
    else
    {
      setIsDeleteModalOpen(false);
      alert("An error occurred while deleting the account.");
    }
  };

  useEffect(() =>
  {
    const fetchData = async () =>
    {
      setLoading(true);
      setError(null);

      // If paramUsername exists, fetch that user's profile
      if (paramUsername) 
      {
        try 
        {
          // Fetch stats to verify user exists
          const statsResponse = await fetch(`/api/stats/${paramUsername}`);
          if (statsResponse.ok) 
          {
            const statsData = await statsResponse.json();
            
            // Check if user has any stats data (difficulties will be null if user doesn't exist)
            if (statsData.difficulties === null) 
            {
              setError(`User "${paramUsername}" not found`);
              setLoading(false);
              return;
            }
            
            // Fetch user details from user service to get display_name and other info
            let userDetails = { username: paramUsername };
            try {
              const userResponse = await fetch(`/api/v1/user/by-username/${paramUsername}/`);
              if (userResponse.ok) {
                userDetails = await userResponse.json();
              }
            } catch (err) {
              console.error("Could not fetch detailed user info:", err);
              // Continue with minimal userDetails
            }
            
            setUserDetails(userDetails);
            setStats(statsData);
            
            // Check if this is the current user's own profile
            const isCurrentUser = user?.username === paramUsername;
            setIsOtherUser(!isCurrentUser);
          } 
          else 
          {
            setError(`User "${paramUsername}" not found`);
            setLoading(false);
            return;
          }
        } 
        catch (error) 
        {
          console.error("Error fetching user profile:", error);
          setError(`User "${paramUsername}" not found`);
          setLoading(false);
          return;
        }
      }
      // Otherwise, fetch current user's profile
      else if (user)
      {
        try {
          const details = await getUserDetails();
          if (details)
          {
            setUserDetails(details);
            const statsData = await getUserStats(details.id);
            setStats(statsData);
            setIsOtherUser(false);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError("Failed to load profile");
        }
      }
      else
      {
        navigate('/');
        return;
      }

      setLoading(false);
    };

    fetchData();
  }, [user, paramUsername, navigate]);

  if (!user && !paramUsername)
    return null;

  return (
    <div className="profile-page-container" style={{ position: 'relative' }}>
      <BackToHomeLink />

      {error && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee2e2', 
          color: '#7f1d1d',
          borderRadius: '8px',
          margin: '20px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {loading && !error ? (
        <div style={{ color: '#14532d', marginTop: '100px', textAlign: 'center' }}>Loading Profile...</div>
      ) : !error ? (
        <>
          <ProfileContent
            userDetails={userDetails}
            stats={stats}
            onLogout={isOtherUser ? null : handleLogout}
            onDeleteAccount={isOtherUser ? null : handleDeleteRequest}
            isOtherUser={isOtherUser}
          />

          {!isOtherUser && (
            <ConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={handleConfirmDelete}
              title="Delete Account"
              message="Are you sure you want to delete your account? This action cannot be undone and you will lose all your data."
            />
          )}
        </>
      ) : null}
    </div>
  );
};

export default Profile;