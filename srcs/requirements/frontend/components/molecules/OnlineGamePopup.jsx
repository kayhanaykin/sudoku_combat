import React, { useState, useEffect } from 'react';
import '../../styles/OnlineGamePopup.css';
import ActionBtn from '../atoms/ActionBtn';

const OnlineGameModal = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  onJoin, 
  isLoading,
  createdRoomId,
  isOpponentJoined,
  onCountdownComplete
}) => {
  const [view, setView] = useState('LOBBY'); 
  const [countdown, setCountdown] = useState(3);
  
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);

  useEffect(() => {
    if (isOpen && view === 'LOBBY')
    {
      fetchRooms();
      const interval = setInterval(fetchRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, view]);

  const fetchRooms = async () => {
    setIsFetchingRooms(true);
    try
    {
      const res = await fetch('https://localhost:8443/api/room/list');
      const data = await res.json();
      
      if (data.success && data.rooms)
      {
        const waitingRooms = data.rooms.filter(r => r.status === 'waiting');
        setAvailableRooms(waitingRooms);
      }
    }
    catch (error)
    {
      console.error("Odalar çekilemedi:", error);
    }
    finally
    {
      setIsFetchingRooms(false);
    }
  };

  useEffect(() => {
    if (createdRoomId && !isOpponentJoined)
    {
      setView('WAITING');
    }
  }, [createdRoomId, isOpponentJoined]);

  useEffect(() => {
    let pollInterval;
    
    if (view === 'WAITING' && createdRoomId)
    {
      pollInterval = setInterval(async () => {
        try
        {
          const res = await fetch(`https://localhost:8443/api/room/game-state/${createdRoomId}`);
          const data = await res.json();
          
          if (data.success && data.status === 'playing')
          {
            clearInterval(pollInterval);
            setView('COUNTDOWN');
            setCountdown(3);
          }
        }
        catch (error)
        {
          console.error("Oda durumu kontrol edilirken hata oluştu:", error);
        }
      }, 2000);
    }

    return () => clearInterval(pollInterval);
  }, [view, createdRoomId]);
  // -------------------------------------------------------------

  useEffect(() => {
    if (isOpponentJoined)
    {
      setView('COUNTDOWN');
      setCountdown(3);
    }
  }, [isOpponentJoined]);

  useEffect(() => {
    let timer;
    if (view === 'COUNTDOWN' && countdown > 0)
    {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    else if (view === 'COUNTDOWN' && countdown === 0)
    {
      if (onCountdownComplete)
        onCountdownComplete();
    }
    return () => clearTimeout(timer);
  }, [view, countdown, onCountdownComplete]);

  useEffect(() => {
    if (!isOpen)
    {
      setView('LOBBY');
      setCountdown(3);
    }
  }, [isOpen]);

  if (!isOpen)
    return null;

  return (
    <div className="online-overlay" onClick={view === 'LOBBY' ? onClose : null}>
      <div className="online-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* --- 1. DURUM: LOBİ EKRANI (LİSTE) --- */}
        {view === 'LOBBY' && (
          <>
            <h2 className="online-title">Lobbies</h2>
            
            <div className="lobby-actions">
              <ActionBtn 
                className="online-action-btn create-btn" 
                onClick={onCreate}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : '⚡ Create New Room'}
              </ActionBtn>
              <button className="refresh-btn" onClick={fetchRooms} disabled={isFetchingRooms}>
                🔄 Refresh
              </button>
            </div>

            <div className="rooms-list-container">
              <h3 className="list-title">Available Rooms</h3>
              
              {isFetchingRooms && availableRooms.length === 0 ? (
                <div className="spinner"></div>
              ) : availableRooms.length === 0 ? (
                <p className="no-rooms-msg">No active rooms found. Be the first to create one!</p>
              ) : (
                <ul className="rooms-list">
                  {availableRooms.map(room => (
                    <li 
                      key={room.id} 
                      className="room-item" 
                      onClick={() => onJoin(room.id)}
                    >
                      <div className="room-info">
                        <span className="room-owner">
                          <span className="room-id-badge">#{room.id}</span>
                          {room.ownerName || 'Unknown Player'}
                        </span>
                        <span className="room-difficulty">
                          Difficulty: <strong>{room.difficulty || 'Normal'}</strong>
                        </span>
                      </div>
                      <div className="room-status">
                        <span className="player-count">1 / 2</span>
                        <button className="join-btn-small" disabled={isLoading}>
                          Join
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ActionBtn 
              className="online-action-btn online-close-btn" 
              onClick={onClose} 
              disabled={isLoading}
            >
              Close
            </ActionBtn>
          </>
        )}

        {/* --- 2. DURUM: BEKLEME EKRANI --- */}
        {view === 'WAITING' && (
          <div className="online-waiting-view">
            <h2 className="online-title">Room Created!</h2>
            <div className="room-id-display">
              <p>Your Room ID:</p>
              <h3 className="room-id-text">{createdRoomId}</h3>
            </div>
            <div className="waiting-spinner-container">
              <div className="spinner"></div>
              <p>Waiting for opponent to join...</p>
            </div>
            <ActionBtn className="online-action-btn cancel-room-btn" onClick={onClose}>
              Cancel Room
            </ActionBtn>
          </div>
        )}

        {/* --- 3. DURUM: GERİ SAYIM EKRANI --- */}
        {view === 'COUNTDOWN' && (
          <div className="online-countdown-view">
            <h2 className="online-title">Game Starting!</h2>
            <div className="countdown-circle">
              <h1>{countdown}</h1>
            </div>
            <p>Get ready...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default OnlineGameModal;