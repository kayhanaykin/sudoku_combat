import React from 'react';
import { useNavigate } from 'react-router-dom';
import useGameLogic from '../src/hooks/useGameLogic';

import GameHeader from '../components/molecules/GameHeader';
import PlayerCard from '../components/molecules/PlayerCard';
import SudokuBoard from '../components/organisms/SudokuBoard';
import Numpad from '../components/molecules/Numpad';
import HintModal from '../components/organisms/HintModal';
import ActionBtn from '../components/atoms/ActionBtn';

import '../styles/Game.css';

const OfflineGame = () => {
  const navigate = useNavigate();

  const { 
    board, timer, difficulty, lives, selectedCell, isGameOver,
    handleCellClick, handleInput, showError, errorMessage,
    isHintModalOpen, hintData, 
    handleHint, applyHint
  } = useGameLogic('offline'); 

  return (
    <div className="game-container">
      
      <GameHeader 
        timer={timer} 
        difficulty={difficulty} 
        onHomeClick={() => navigate('/')} 
      />

      <div className="game-main-area">
        <PlayerCard title="Player 1" lives={lives} />

        <SudokuBoard 
          board={board}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          showError={showError}
          errorMessage={errorMessage}
          isGameOver={isGameOver}
        />

        <div className="player-card right-card">
           <div className="card-title">Mode</div>
           <div className="mode-text">Offline</div>
        </div>
      </div>

      <div className="controls-area">
        <ActionBtn onClick={() => handleInput(0)} disabled={isGameOver}>
          Erase
        </ActionBtn>
        
        <ActionBtn onClick={handleHint} disabled={isGameOver}>
          Hint
        </ActionBtn>
        
      </div>

      <Numpad onNumberClick={handleInput} disabled={isGameOver} />

      <HintModal 
        isOpen={isHintModalOpen} 
        data={hintData} 
        onApply={applyHint} 
      />

    </div>
  );
};

export default OfflineGame;