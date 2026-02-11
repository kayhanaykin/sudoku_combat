import React, { useState } from 'react';
import ActionBtn from '../atoms/ActionBtn';

const AddFriendForm = ({ onAdd }) => 
{
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => 
    {
        e.preventDefault();
        if (!username.trim()) return;
        
        onAdd(username).then((success) => 
        {
            if (success) setUsername('');
        });
    };

    return (
        <form className="add-friend-wrapper" onSubmit={handleSubmit}>
            <input
                type="text"
                className="friend-input"
                placeholder="Username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <ActionBtn className="btn-add">
                +
            </ActionBtn>
        </form>
    );
};

export default AddFriendForm;