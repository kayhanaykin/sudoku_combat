import React, { useState } from 'react';

// API'den gelecek
const DUMMY_BADGES = [
  { id: 1, icon: '🥇', name: 'First Win' },
  { id: 2, icon: '🚀', name: 'Speedster' },
  { id: 3, icon: '🛡️', name: 'Defender' },
  { id: 4, icon: '🔥', name: 'On Fire' },
  { id: 5, icon: '🤖', name: 'Bot Killer' },
  { id: 6, icon: '🎓', name: 'Graduate' },
  { id: 7, icon: '🌟', name: 'Star' },
  { id: 8, icon: '💎', name: 'Rich' },
  { id: 9, icon: '👑', name: 'King' },
  { id: 10, icon: '🎯', name: 'Sniper' },
  { id: 11, icon: '👻', name: 'Ghost' },
  { id: 12, icon: '💩', name: 'Lucky' },
];

const BadgeWidget = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(DUMMY_BADGES.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBadges = DUMMY_BADGES.slice(startIndex, startIndex + itemsPerPage);

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
            ({DUMMY_BADGES.length})
        </span>
      </h3>

      <div className="m-badge-grid">
        {currentBadges.map(badge => (
          <div key={badge.id} className="a-badge-item">
            <span className="a-badge-icon">{badge.icon}</span>
            <span className="a-badge-name">{badge.name}</span>
          </div>
        ))}
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