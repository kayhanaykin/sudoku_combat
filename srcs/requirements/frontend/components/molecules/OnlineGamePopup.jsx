import React, { useState } from 'react';
import '../../styles/OnlineGamePopup.css';

const OnlineGameModal = ({ isOpen, onClose, onCreate, onJoin, isLoading }) => {
  const [roomIdInput, setRoomIdInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="online-overlay" onClick={onClose}>
      <div className="online-modal" onClick={(e) => e.stopPropagation()}>
        
        <h2 className="online-title">Multiplayer Lobby</h2>

        <div className="online-content">
          {/* --- CREATE SECTION --- */}
          <div className="online-section">
            <p className="online-description">Start a new game and invite a friend.</p>
            <button 
              className="online-action-btn create-btn" 
              onClick={onCreate}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : '⚡ Create Room'}
            </button>
          </div>

          <div className="online-divider">
            <span>OR</span>
          </div>

          {/* --- JOIN SECTION --- */}
          <div className="online-section">
            <p className="online-description">Enter a Room ID to join a match.</p>
            <div className="online-input-group">
              <input 
                type="number" 
                placeholder="Room ID" 
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="online-input"
                disabled={isLoading}
              />
              <button 
                className="online-action-btn join-btn" 
                onClick={() => onJoin(roomIdInput)}
                disabled={isLoading || !roomIdInput}
              >
                {isLoading ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        </div>

        <button className="online-close-btn" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OnlineGameModal;