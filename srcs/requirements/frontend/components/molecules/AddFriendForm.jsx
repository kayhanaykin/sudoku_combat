import React, { useState } from 'react';

const AddFriendForm = ({ onAdd }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = async () => {
    if (!username.trim())
        return;
    const success = await onAdd(username);
    if (success)
        setUsername('');
  };

  return (
    <div style={containerStyle}>
      <input
        type="text"
        placeholder="Username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
      />
      <button onClick={handleSubmit} style={buttonStyle}>
        Add
      </button>
    </div>
  );
};

const containerStyle = {
  marginTop: '10px',
  display: 'flex',
  gap: '5px'
};

const inputStyle = {
  flex: 1,
  padding: '8px',
  borderRadius: '8px',
  border: 'none',
  outline: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.9)'
};

const buttonStyle = {
  padding: '8px 15px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#4CAF50',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default AddFriendForm;