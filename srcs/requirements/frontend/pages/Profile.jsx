import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import ProfileContent from '../components/organisms/ProfileContent';
import ConfirmationModal from '../components/organisms/ConfirmationModal';
import { getUserDetails, getUserStats, logoutUser, deleteUserAccount } from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [userDetails, setUserDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleLogout = async () => {
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

  const handleDeleteRequest = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
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

  useEffect(() => {
    const fetchData = async () => {
      if (!user)
        return;
      setLoading(true);
      
      const details = await getUserDetails();
      if (details)
      {
        setUserDetails(details);
        const statsData = await getUserStats(details.id);
        setStats(statsData);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!user)
    return null;

  return (
    <div className="profile-page-container" style={{ position: 'relative' }}>
      <BackToHomeLink />
      
      {loading ? (
        <div style={{ color: '#14532d', marginTop: '100px' }}>Loading Profile...</div>
      ) : (
        <>
          <ProfileContent 
            userDetails={userDetails} 
            stats={stats} 
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteRequest}
          />

          <ConfirmationModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Delete Account"
            message="Are you sure you want to delete your account? This action cannot be undone and you will lose all your data."
          />
        </>
      )}
    </div>
  );
};

export default Profile;