import React from 'react';
import '../../styles/DifficultyModal.css';

const DifficultyModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen)
    return null;

  const levels = [
    { level: 1, label: 'Easy', color: '#2ecc71' },
    { level: 2, label: 'Medium', color: '#3498db' },
    { level: 3, label: 'Hard', color: '#f1c40f' },
    { level: 4, label: 'Expert', color: '#e67e22' },
    { level: 5, label: 'Extreme', color: '#e74c3c' },
  ];

  return (
    <div className="difficulty-overlay" onClick={onClose}>
      <div className="difficulty-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="difficulty-title">Select Difficulty</h2>
        <div className="difficulty-grid">
          {levels.map((item) => (
            <button
              key={item.level}
              className="difficulty-btn"
              style={{ backgroundColor: item.color }}
              onClick={() => onSelect(item.level)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className="difficulty-close-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default DifficultyModal;