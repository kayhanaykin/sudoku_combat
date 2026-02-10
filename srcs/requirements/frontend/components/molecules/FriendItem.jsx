import React from 'react';

const FriendItem = ({ id, username, isOnline, status, onApprove, onRemove }) => {
  const isPending = status === 'pending';

  return (
    <div style={containerStyle}>
      <div style={infoStyle}>
        {!isPending && (
          <div style={{ 
            ...statusDotStyle, 
            backgroundColor: isOnline ? '#4CAF50' : '#ccc' 
          }} />
        )}
        <span style={textStyle}>{username}</span>
      </div>
      
      <div style={actionContainerStyle}>
        {isPending && (
          <button 
            onClick={() => onApprove(id)} 
            style={{ ...btnStyle, backgroundColor: '#4CAF50' }}
          >
            ✓
          </button>
        )}
        <button 
          onClick={() => onRemove(id)} 
          style={{ ...btnStyle, backgroundColor: '#f44336' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  marginBottom: '5px'
};

const infoStyle = {
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px'
};

const statusDotStyle = {
  width: '8px', 
  height: '8px', 
  borderRadius: '50%'
};

const textStyle = {
  color: 'white'
};

const actionContainerStyle = {
  display: 'flex', 
  gap: '5px'
};

const btnStyle = {
  border: 'none',
  color: 'white',
  borderRadius: '4px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '0.8rem'
};

export default FriendItem;