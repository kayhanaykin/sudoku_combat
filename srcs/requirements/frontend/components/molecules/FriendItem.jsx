import React from 'react';
import ActionBtn from '../atoms/ActionBtn';

const FriendItem = ({ id, username, displayName, avatar, status, isOnline, onApprove, onRemove }) => 
{
    const isPending = status === 'pending';
    const BASE_URL = 'https://localhost:8443'; 
    
    const statusClass = isPending 
        ? 'pending' 
        : (isOnline ? 'online' : 'offline');

    let avatarSrc;

    if (avatar)
    {
        avatarSrc = avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
    }
    else
    {
        avatarSrc = "https://ui-avatars.com/api/?background=random&name=" + username;
    }

    return (
        <div className="friend-item">
            <div className="user-info">
                <div className="avatar-wrapper">
                    <img 
                        src={avatarSrc} 
                        alt={username} 
                        className="friend-avatar" 
                        onError={(e) => { e.target.src = "https://ui-avatars.com/api/?background=random&name=" + username; }}
                    />
                    <div className={`status-indicator ${statusClass}`} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="username" style={{ fontSize: '0.95rem' }}>
                        {displayName || username}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        @{username}
                    </span>
                </div>
            </div>
            
            <div className="actions">
                {isPending && (
                    <ActionBtn 
                        className="action-btn btn-approve" 
                        onClick={() => onApprove(id)}
                    >
                        ✓
                    </ActionBtn>
                )}
                <ActionBtn 
                    className="action-btn btn-remove" 
                    onClick={() => onRemove(id)}
                >
                    ✕
                </ActionBtn>
            </div>
        </div>
    );
};

export default FriendItem;