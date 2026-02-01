import React from 'react';
import ProfileButton from '../atoms/ProfileButton';

const FriendListWidget = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ProfileButton onClick={() => console.log('Friends')}>Friend List</ProfileButton>
      
      <div style={{
        flex: 1,
        marginTop: '10px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: '10px',
        minHeight: '400px'
      }}>
        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          No friends online
        </p>
      </div>
    </div>
  );
};

export default FriendListWidget;