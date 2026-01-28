import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
import Navbar from '../components/molecules/Navbar';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div style={{ 
        padding: '100px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        color: 'white' 
      }}>
        <h1>User Profile</h1>
        
        {user ? (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '2rem', 
            borderRadius: '16px',
            textAlign: 'center',
            minWidth: '300px'
          }}>
            <h2>👤 {user.username}</h2>
            <p>Email: {user.email || 'No email'}</p>
            <p>ID: {user.id}</p>
            
            <button 
              onClick={handleLogout}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Log Out
            </button>
          </div>
        ) : (
          <p>Please log in to see your profile.</p>
        )}
      </div>
    </>
  );
};

export default Profile;