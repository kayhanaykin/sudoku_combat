import React from 'react';
const SudokuCell = ({ value, isFixed, isError, isSelected, isHighlighted, isSameNumber, onClick }) => {
  return (
    <div
      className={`sudoku-cell 
        ${isSelected ? 'selected' : ''}
        ${isSameNumber ? 'highlighted-same-number' : ''} 
        ${isHighlighted ? 'highlighted-area' : ''}
        ${isFixed ? 'fixed' : ''}
        ${isError ? 'error' : ''}
      `}
      onClick={onClick}
    >
      {value !== 0 ? value : ''}
    </div>
  );
};

export default SudokuCell;