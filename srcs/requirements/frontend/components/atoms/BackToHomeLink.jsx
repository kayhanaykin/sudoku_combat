import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/BackToHomeLink.css';

const BackToHomeLink = () => {
  return (
    <Link to="/" className="a-home-btn">
      <span className="a-home-icon">🏠</span>
      <span className="a-home-text">Go to Homepage</span>
    </Link>
  );
};

export default BackToHomeLink;