import React, { useEffect } from 'react';
import '../../styles/ProfileContent.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen)
    return null;

  return (
    <div className="o-modal-overlay" onClick={onClose}>
      <div className="o-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="o-modal-header">
          <h3>{title}</h3>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Kapat"
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
        <div className="o-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;