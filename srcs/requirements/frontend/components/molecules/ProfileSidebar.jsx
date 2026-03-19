import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '../atoms/ProfileImage';
import ProfileButton from '../atoms/ProfileButton';

const ProfileSidebar = ({ avatarUrl, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <ProfileImage src={avatarUrl} alt="User Avatar" />

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <ProfileButton variant="danger" onClick={onLogout}>
          Log Out
        </ProfileButton>
      </div>
    </div>
  );
};

export default ProfileSidebar;