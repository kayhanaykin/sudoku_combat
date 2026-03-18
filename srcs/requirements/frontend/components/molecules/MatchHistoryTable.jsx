import React, { useEffect, useState } from 'react';
import { getMatchHistory } from '../../services/api';
import '../../styles/MatchHistory.css';

const MatchHistoryTable = ({ username }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const difficultyMap = {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard',
    4: 'Expert',
    5: 'Extreme'
  };

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    const fetchMatchHistory = async () => {
      try {
        setLoading(true);
        const data = await getMatchHistory(username);
        // data is an object with { matches: [...], username, count }
        const matches = data?.matches || [];
        setMatches(matches);
        setError(null);
      } catch (err) {
        console.error('Error fetching match history:', err);
        setError('Failed to load match history');
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchHistory();
  }, [username]);

  if (!username) {
    return <div className="history-container">Please log in to view match history</div>;
  }

  if (loading) {
    return <div className="history-container">Loading match history...</div>;
  }

  if (error) {
    return <div className="history-container error">{error}</div>;
  }

  if (!matches || matches.length === 0) {
    return <div className="history-container">No matches yet</div>;
  }

  return (
    <div className="history-container">
      <h3>Recent Matches</h3>
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Opponent</th>
              <th>Difficulty</th>
              <th>Duration</th>
              <th>Result</th>
              <th>Mode</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, idx) => (
              <tr key={idx}>
                <td>{match.opponent || 'Solo'}</td>
                <td>{difficultyMap[match.difficulty] || 'Unknown'}</td>
                <td>{Math.round(match.time_seconds || 0)}s</td>
                <td>
                  <span className={`history-result ${match.result?.toLowerCase()}`}>
                    {match.result?.toUpperCase() || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={`history-mode ${match.mode?.toLowerCase()}`}>
                    {match.mode?.toUpperCase() || 'N/A'}
                  </span>
                </td>
                <td>{new Date(match.played_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchHistoryTable;
