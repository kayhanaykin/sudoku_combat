import React, { useState } from 'react';
import useFriendList from '../../src/hooks/useFriendList';
import '../../styles/FriendListWidget.css';

// --- ATOM: Action Button ---
const ActionButton = ({ type, onClick, icon }) => (
  <button 
    className={`action-icon-btn btn-${type}`} 
    onClick={onClick}
    title={type === 'approve' ? 'Accept' : 'Remove'}
  >
    {icon}
  </button>
);

// --- MOLECULE: Add Friend Form ---
const AddFriendForm = ({ onAdd }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    const success = await onAdd(username);
    if (success) setUsername('');
  };

  return (
    <form className="add-friend-wrapper" onSubmit={handleSubmit}>
      <input
        type="text"
        className="friend-input"
        placeholder="Add username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit" className="add-btn">+</button>
    </form>
  );
};

// --- MOLECULE: Friend Item ---
const FriendItem = ({ id, username, status, isOnline, onApprove, onRemove }) => {
  const isPending = status === 'pending';
  
  const dotClass = isPending ? 'pending' : (isOnline ? 'online' : 'offline');

  return (
    <div className="friend-item">
      <div className="user-info">
        <div className={`status-dot ${dotClass}`} title={isPending ? 'Pending' : (isOnline ? 'Online' : 'Offline')} />
        <span className="username">{username}</span>
      </div>
      
      <div className="actions">
        {isPending && (
          <ActionButton 
            type="approve" 
            onClick={() => onApprove(id)} 
            icon="✓" 
          />
        )}
        <ActionButton 
          type="remove" 
          onClick={() => onRemove(id)} 
          icon="✕" 
        />
      </div>
    </div>
  );
};

// --- ORGANISM: Friend List Widget ---
const FriendListWidget = () => {
  const { 
    friends, 
    loading, 
    error, 
    successMsg, 
    addFriend, 
    approveFriend, 
    removeFriend, 
    refresh 
  } = useFriendList();

  const pendingRequests = friends.filter(f => f.status === 'pending');
  const activeFriends = friends.filter(f => f.status === 'accepted');

  return (
    <div className="friend-widget-container">
      
      {/* Header */}
      <div className="widget-header">
        <span className="widget-title">Social Hub</span>
        <button onClick={refresh} className="refresh-btn" title="Refresh List">
          ⟳
        </button>
      </div>

      {/* Input Form */}
      <AddFriendForm onAdd={addFriend} />

      {/* Feedback Messages */}
      {error && <div className="status-msg msg-error">{error}</div>}
      {successMsg && <div className="status-msg msg-success">{successMsg}</div>}

      {/* List Content */}
      <div className="friend-list-scroll">
        {loading ? (
          <div className="msg-empty">Loading network...</div>
        ) : (
          <>
            {/* PENDING SECTION */}
            {pendingRequests.length > 0 && (
              <>
                <h5 className="section-title">Friend Requests ({pendingRequests.length})</h5>
                {pendingRequests.map(req => (
                  <FriendItem
                    key={req.id}
                    id={req.id}
                    username={req.username || req.user}
                    status="pending"
                    onApprove={approveFriend}
                    onRemove={removeFriend}
                  />
                ))}
              </>
            )}

            {/* ACTIVE FRIENDS SECTION */}
            <h5 className="section-title">Friends ({activeFriends.length})</h5>
            
            {activeFriends.length === 0 && (
              <p className="msg-empty">No active friends found.</p>
            )}

            {activeFriends.map(friend => (
              <FriendItem
                key={friend.id}
                id={friend.id}
                username={friend.username || friend.user}
                status="accepted"
                isOnline={friend.is_online}
                onRemove={removeFriend}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendListWidget;