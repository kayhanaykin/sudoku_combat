import React, { useState } from 'react';
import useGameLogic from '../src/hooks/useGameLogic';
import '../styles/Game.css';
import GameHeader from '../components/molecules/GameHeader';
import PlayerCard from '../components/molecules/PlayerCard';
import Numpad from '../components/molecules/Numpad';
import SudokuBoard from '../components/organisms/SudokuBoard';
import HintModal from '../components/organisms/HintModal';
import ActionBtn from '../components/atoms/ActionBtn';
import BackToHomeLink from '../components/atoms/BackToHomeLink';

const OnlineGame = () => {
  const { 
    board, timer, difficulty, lives, selectedCell, isGameOver,
    showError, errorMessage,
    isHintModalOpen, hintData,
    handleCellClick, handleInput, handleHint, applyHint
  } = useGameLogic('online');

  const [opponentLives, setOpponentLives] = useState(3);

  return (
    <div className="game-container" style={{ position: 'relative' }}>
      
      {/* --- GO TO HOMEPAGE BUTTON (ATOM) --- */}
      <BackToHomeLink />

      {/* --- HEADER --- */}
      <GameHeader 
        timer={timer} 
        difficulty={difficulty} 
      />

      {/* --- MAIN AREA --- */}
      <div className="game-main-area">
        
        {/* LEFT: Player 1 */}
        <PlayerCard 
          title="Player 1" 
          score={0} 
          lives={lives} 
        />

        {/* Sudoku Board */}
        <SudokuBoard 
          board={board}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          showError={showError}
          errorMessage={errorMessage}
          isGameOver={isGameOver}
        />

        {/* RIGHT: Player 2 (Enemy) */}
        <PlayerCard 
          title="Player 2" 
          score={0} 
          lives={opponentLives} 
          align="right" 
        />
      </div>

      <div className="controls-area">
        <ActionBtn onClick={() => handleInput(0)} disabled={isGameOver}>
          Erase
        </ActionBtn>
        <ActionBtn onClick={handleHint} disabled={isGameOver}>
          Hint
        </ActionBtn>
      </div>

      {/* --- NUMPAD --- */}
      <Numpad onNumberClick={handleInput} disabled={isGameOver} />

      {/* --- HINT MODAL --- */}
      <HintModal 
        isOpen={isHintModalOpen} 
        data={hintData} 
        onApply={applyHint} 
      />

    </div>
  );
};

export default OnlineGame;