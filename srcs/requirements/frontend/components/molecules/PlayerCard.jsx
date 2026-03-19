import React from 'react';
import ProfileImage from '../atoms/ProfileImage';

const BASE_URL = '';

const PlayerCard = ({ title, lives, align, avatar }) => 
{
    let finalAvatarUrl = null;
    
    if (avatar) 
        finalAvatarUrl = avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;

    const renderHearts = () => 
    {
        const hearts = [];
        for (let i = 0; i < 3; i++) 
        {
            hearts.push(
                <span key={i} className={`heart-icon ${i >= lives ? 'broken' : ''}`}>
                    {i >= lives ? '🖤' : '❤️'}
                </span>
            );
        }
        return hearts;
    };

    return (
        <div className={`player-card ${align === 'right' ? 'right-card' : ''}`}>
            
            <ProfileImage 
                src={finalAvatarUrl} 
                className="game-avatar" 
            />

            <div className="card-title">{title}</div>
            
            <div className="hearts-container">
                {renderHearts()}
            </div>
            
        </div>
    );
};

export default PlayerCard;