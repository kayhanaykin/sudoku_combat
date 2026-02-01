import React from 'react';

const LeaderboardTabs = ({ modes, currentMode, onModeChange }) =>
{
  return (
    <div className="tab-container">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onModeChange(m)}
          className={`tab-button ${currentMode === m ? 'active' : ''}`}
        >
          {m}
        </button>
      ))}
    </div>
  );
};

export default LeaderboardTabs;