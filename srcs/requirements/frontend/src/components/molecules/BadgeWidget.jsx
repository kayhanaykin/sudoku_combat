import React, { useState, useEffect } from 'react';
import { getUserAchievements } from '../../services/api';

const BadgeWidget = ({ username }) => {
  const [achievements, setAchievements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchAchievements = async () => {
      if (username) {
        const data = await getUserAchievements(username);
        setAchievements(data);
      }
    };

    fetchAchievements();
  }, [username]);

  const totalPages = Math.ceil(achievements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBadges = achievements.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages)
        setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1)
        setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="profile-card-base m-badge-section">
      <h3>
        Achievements 
        <span style={{fontSize: '0.9rem', color: '#888'}}>
            ({achievements.length})
        </span>
      </h3>

      <div className="m-badge-grid">
        {currentBadges.length > 0 ? (
          currentBadges.map(badge => (
            <div key={badge.id} className="a-badge-item" title={`Earned: ${new Date(badge.earned_at).toLocaleDateString()}`}>
              <span className="a-badge-icon">{badge.icon}</span>
              <span className="a-badge-name">{badge.name}</span>
            </div>
          ))
        ) : (
          <p style={{gridColumn: '1/-1', textAlign: 'center', color: '#999'}}>
            No achievements unlocked yet
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="m-pagination-controls">
          <button 
            className="a-page-btn" 
            onClick={handlePrev} 
            disabled={currentPage === 1}
          >
            &lt; Prev
          </button>
          <span style={{alignSelf:'center', fontSize:'0.9rem'}}>
            {currentPage} / {totalPages}
          </span>
          <button 
            className="a-page-btn" 
            onClick={handleNext} 
            disabled={currentPage === totalPages}
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default BadgeWidget;