import React from 'react';

const HintModal = ({ isOpen, data, onApply }) => {
  if (!isOpen || !data)
    return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-title">💡 Hint Found!</div>
        <p className="modal-message">
          {data.message}
        </p>
        <div style={{fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#2980b9'}}>
          {data.value}
        </div>
        <button className="modal-btn" onClick={onApply}>
          Apply Hint
        </button>
      </div>
    </div>
  );
};

export default HintModal;