import React from 'react';
import InfoBadge from '../atoms/InfoBadge';

const GameHeader = ({ timer, difficulty, onHomeClick }) => {
  return (
    <div className="game-header-wrapper">
      <div className="game-header">
        <InfoBadge text={timer} type="timer" />
        <InfoBadge text={difficulty} type="difficulty" />
      </div>
    </div>
  );
};

export default GameHeader;