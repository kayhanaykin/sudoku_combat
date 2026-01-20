const Card = ({ children, className = "", onClick }) => {
  return (
    <div 
      className={`card ${className}`} 
      onClick={onClick}
      style={{
        backgroundColor: 'var(--secondary)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
        padding: '2rem'
      }}
    >
      {children}
    </div>
  );
};
export default Card;