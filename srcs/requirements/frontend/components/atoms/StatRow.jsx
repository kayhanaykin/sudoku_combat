import React from 'react';

const StatRow = ({ label, value, indent = false }) => {
  return (
    <div className={`a-stat-row ${indent ? 'indent' : ''}`}>
      <span className="a-stat-label">{label}:</span>
      <span className="a-stat-value">{value || '-'}</span>
    </div>
  );
};
export default StatRow;