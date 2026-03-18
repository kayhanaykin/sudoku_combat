import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PlayerInfoPopup.css';

const PlayerInfoPopup = ({ isOpen, onClose, username }) => {
  const navigate = useNavigate();
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !username) return;

    const fetchPlayerInfo = async () => {
      try {
        setLoading(true);
        // Fetch user info from stats service
        const response = await fetch(`/api/stats/${username}`);
        if (response.ok) {
          const data = await response.json();
          setPlayerInfo(data);
        }
      } catch (error) {
        console.error('Error fetching player info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerInfo();
  }, [isOpen, username]);

  const handleViewProfile = () => {
    navigate(`/profile/${username}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="player-info-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose}>×</button>

        {loading ? (
          <div className="popup-loading">Loading...</div>
        ) : (
          <div className="popup-content">
            <div className="popup-header">
              <h3>{username}</h3>
            </div>

            {playerInfo && (
              <div className="popup-stats">
                <div className="stat-row">
                  <span className="stat-label">Total Games:</span>
                  <span className="stat-value">
                    {(playerInfo.difficulties || {})['1']?.['online']?.['wins'] ? 
                      Object.values(playerInfo.difficulties || {}).reduce((acc, diff) => {
                        return acc + ((diff.online?.wins || 0) + (diff.online?.losses || 0)) + 
                                     ((diff.offline?.wins || 0) + (diff.offline?.losses || 0));
                      }, 0) : 0}
                  </span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Total Wins:</span>
                  <span className="stat-value">
                    {Object.values(playerInfo.difficulties || {}).reduce((acc, diff) => {
                      return acc + (diff.online?.wins || 0) + (diff.offline?.wins || 0);
                    }, 0)}
                  </span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Username:</span>
                  <span className="stat-value">@{username}</span>
                </div>
              </div>
            )}

            <div className="popup-actions">
              <button className="view-profile-btn" onClick={handleViewProfile}>
                View Full Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerInfoPopup;
