import React from 'react';

const getRankStyle = (index) => {
  switch (index) {
    case 0:
      return { 
        color: '#FFD700',
        icon: '🥇', 
        bg: '#fff9c4',
        border: '1px solid #FFD700'
      };
    case 1:
      return { 
        color: '#C0C0C0',
        icon: '🥈', 
        bg: '#f8f9fa',
        border: '1px solid #C0C0C0'
      };
    case 2:
      return { 
        color: '#CD7F32',
        icon: '🥉', 
        bg: '#f8f9fa',
        border: '1px solid #CD7F32'
      };
    default:
      return { 
        color: '#666', 
        icon: `#${index + 1}`, 
        bg: '#ffffff',
        border: '1px solid transparent'
      };
  }
};

const Leaderboard = ({ players = [] }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      padding: '1.5rem',
      width: '100%',
      maxWidth: '400px',
      height: 'fit-content',
      border: '1px solid #eaeaea'
    }}>
      <h3 style={{
        margin: '0 0 1.5rem 0',
        color: '#2c3e50',
        textAlign: 'center',
        borderBottom: '2px solid #f0f2f5',
        paddingBottom: '1rem',
        fontSize: '1.5rem'
      }}>
        🏆 Leaderboard
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map((player, index) => {
            const style = getRankStyle(index);
            
            return (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: style.bg,
                borderRadius: '12px',
                border: style.border,
                transition: 'transform 0.2s',
                boxShadow: index < 3 ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    fontSize: index < 3 ? '1.5rem' : '1rem', 
                    fontWeight: 'bold',
                    color: style.color,
                    minWidth: '30px',
                    textAlign: 'center'
                  }}>
                    {style.icon}
                  </span>
                  
                  <span style={{ 
                    fontWeight: index < 3 ? 'bold' : '500', 
                    color: '#333',
                    fontSize: '1rem'
                  }}>
                    {player.name}
                  </span>
                </div>

                <span style={{ 
                  color: style.color, 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}>
                  {player.score} pts
                </span>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            There is no player data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;