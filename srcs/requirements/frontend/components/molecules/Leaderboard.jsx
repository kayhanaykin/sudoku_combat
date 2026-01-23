import React, { useState, useEffect } from 'react';
import { getTopPlayers } from '../../services/mockdata';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopPlayers();
        const top5 = data.sort((a, b) => b.score - a.score).slice(0, 5);
        setPlayers(top5);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="leaderboard-column">
      <div className="lb-header" onClick={() => window.location.href='/leaderboard'}>
        <span className="trophy">🏆</span>
        <h3>Top Players</h3>
      </div>

      <ul className="player-list">
        {loading ? (
          <li style={{justifyContent: 'center', color: '#7f8c8d'}}>Loading...</li>
        ) : (
          players.map((player, index) => (
            <li key={player.id}>
              <span className="rank">{index + 1}</span>
              <span className="name">{player.username}</span>
              <span className="score">{player.score}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Leaderboard;