import React from 'react';

const HeartIcon = ({ broken }) => {
  return (
    <span className={`heart-icon ${broken ? 'broken' : ''}`}>
      {broken ? '💔' : '❤️'}
    </span>
  );
};

export default HeartIcon;