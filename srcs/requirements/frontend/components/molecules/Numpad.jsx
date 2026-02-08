import React from 'react';

const Numpad = ({ onNumberClick, disabled }) => {
  return (
    <div className="numpad-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button 
          key={num} 
          className="num-key" 
          onClick={() => onNumberClick(num)}
          disabled={disabled}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default Numpad;