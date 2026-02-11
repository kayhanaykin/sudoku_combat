import React from 'react';
import useFriendList from '../../src/hooks/useFriendList';
import AddFriendForm from '../molecules/AddFriendForm';
import FriendItem from '../molecules/FriendItem';
import '../../styles/FriendListWidget.css';

const FriendListWidget = () =>
{
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

            <div className="widget-header">
                <span className="widget-title">
                    Social Hub
                </span>
                <button onClick={refresh} className="refresh-btn" title="Refresh">
                    ⟳
                </button>
            </div>

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