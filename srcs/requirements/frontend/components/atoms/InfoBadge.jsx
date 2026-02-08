import React from 'react';

const InfoBadge = ({ text, type }) => {
  return <div className={`info-badge ${type}`}>{text}</div>;
};

export default InfoBadge;