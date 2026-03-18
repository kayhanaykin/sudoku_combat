import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFriendList from '../../src/hooks/useFriendList';
import AddFriendForm from '../molecules/AddFriendForm';
import FriendItem from '../molecules/FriendItem';
import '../../styles/FriendListWidget.css';

const FriendListWidget = () =>
{
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
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

    const handleSearchProfile = (e) =>
    {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/profile/${searchInput.trim()}`);
            setSearchInput('');
        }
    };

    return (
        <div className="friend-widget-container">

            <div className="widget-header">
                <span className="widget-title">
                    Social Hub
                </span>
                <button onClick={refresh} className="refresh-btn" title="Refresh">
                    ⟳
                </button>
            </div>

            <form onSubmit={handleSearchProfile} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                        type="text"
                        placeholder="Search profile..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontFamily: 'inherit'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#14532d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                        }}
                    >
                        Go
                    </button>
                </div>
            </form>

            <AddFriendForm onAdd={addFriend} />

            {error && (
                <div className="status-msg msg-error">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="status-msg msg-success">
                    {successMsg}
                </div>
            )}

            <div className="friend-list-scroll">
                {loading ? (
                    <div className="msg-empty">
                        Loading...
                    </div>
                ) : (
                    <>
                        {pendingRequests.length > 0 && (
                            <>
                                <h5 className="section-title">
                                    Requests ({pendingRequests.length})
                                </h5>
                                {pendingRequests.map(req => (
                                    <FriendItem
                                        key={req.id}
                                        id={req.id}
                                        username={req.username}
                                        displayName={req.displayName}
                                        avatar={req.avatar}
                                        status="pending"
                                        onApprove={approveFriend}
                                        onRemove={removeFriend}
                                    />
                                ))}
                            </>
                        )}

                        <h5 className="section-title">
                            Friends ({activeFriends.length})
                        </h5>

                        {activeFriends.length === 0 && (
                            <p className="msg-empty">
                                No active friends.
                            </p>
                        )}

                        {activeFriends.map(friend => (
                            <FriendItem
                                key={friend.id}
                                id={friend.id}
                                username={friend.username}
                                displayName={friend.displayName}
                                avatar={friend.avatar}
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