import React from 'react';
import SudokuCell from '../atoms/SudokuCell';
import { checkIsHighlighted } from '../../src/utils/sudokuUtils';

const SudokuBoard = ({ board, selectedCell, onCellClick, showError, errorMessage, isGameOver }) => {
  let selectedValue = 0;
  
  if (selectedCell && board && board[selectedCell.r] && board[selectedCell.r][selectedCell.c])
    selectedValue = board[selectedCell.r][selectedCell.c].value;

  if (!board || board.length === 0)
    return <div className="loading">Loading Board...</div>;

  return (
    <div className="sudoku-board">
      {board.map((row, rIndex) => (
        <React.Fragment key={rIndex}>
          {row.map((cell, cIndex) => {
            
            const isHighlighted = checkIsHighlighted(rIndex, cIndex, selectedCell);

            const isSameNumber = selectedCell && 
                                 selectedValue !== 0 && 
                                 cell.value === selectedValue &&
                                 !(selectedCell.r === rIndex && selectedCell.c === cIndex);

            return (
              <SudokuCell
                key={`${rIndex}-${cIndex}`}
                value={cell.value}
                isFixed={cell.isFixed}
                isError={cell.isError}
                isSelected={selectedCell?.r === rIndex && selectedCell?.c === cIndex}
                isHighlighted={isHighlighted}
                isSameNumber={isSameNumber}
                onClick={() => onCellClick(rIndex, cIndex)}
              />
            );
          })}
        </React.Fragment>
      ))}

      <div 
        className={`center-toast ${showError ? 'visible' : ''}`} 
        style={isGameOver ? {backgroundColor: 'rgba(44, 62, 80, 0.95)', opacity: 1, visibility: 'visible'} : {}}
      >
        {errorMessage}
        {isGameOver && <div style={{fontSize: '0.5em', marginTop: '10px', fontWeight:'normal'}}>Press Home to Exit</div>}
      </div>
    </div>
  );
};

export default SudokuBoard;