import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();
  
  const styles = {
    cursor: 'pointer',
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#067b35',
    fontFamily: "'Segoe UI', sans-serif",
    userSelect: 'none'
  };

  return (
    <div onClick={() => navigate('/')} style={styles}>
      Sudoku<span style={{ color: '#4ade80' }}>42</span>
    </div>
  );
};

export default Logo;