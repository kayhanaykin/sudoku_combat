import React from 'react';
import HeartIcon from '../atoms/HeartIcon';

const PlayerCard = ({ title, score, lives, maxLives = 3, align = 'left' }) => {
  const renderHearts = () => {
    const hearts = [];
    for (let i = 1; i <= maxLives; i++)
      hearts.push(<HeartIcon key={i} broken={i > lives} />);
    return <div className="hearts-container">{hearts}</div>;
  };

  return (
    <div className={`player-card ${align === 'right' ? 'right-card' : ''}`}>
      <div className="card-title">{title}</div>
      <small>Score: {score}</small>
      {renderHearts()}
    </div>
  );
};

export default PlayerCard;