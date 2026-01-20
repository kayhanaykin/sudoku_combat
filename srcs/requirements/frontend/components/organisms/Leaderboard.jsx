import LeaderboardRow from './LeaderboardRow';
import Typography from '../atoms/Typography';

const Leaderboard = ({ players }) => {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #eaeaea', backgroundColor: '#fff' }}>
      <div style={{ backgroundColor: 'var(--accent-green)', padding: '2rem', textAlign: 'center', color: '#fff' }}>
        <span style={{ fontSize: '3rem' }}>🏆</span>
        <Typography variant="h3" color="#fff">Top Players</Typography>
      </div>
      <ul style={{ listStyle: 'none' }}>
        {players.map((player, index) => (
          <LeaderboardRow 
            key={index} 
            rank={index + 1} 
            name={player.name} 
            score={player.score} 
          />
        ))}
      </ul>
    </div>
  );
};
export default Leaderboard;