import React from 'react';
import InfoBadge from '../atoms/InfoBadge';

const GameHeader = ({ timer, difficulty, onHomeClick }) => {
  return (
    <div className="game-header-wrapper">
      <button className="fixed-home-btn" onClick={onHomeClick}>
        <span className="btn-icon">🏠</span>
        <span className="btn-text">Go to Home</span>
      </button>

      <div className="game-header">
        <InfoBadge text={timer} type="timer" />
        <InfoBadge text={difficulty} type="difficulty" />
      </div>
    </div>
  );
};

export default GameHeader;