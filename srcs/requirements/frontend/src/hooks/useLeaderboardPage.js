import { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/api';

const MODES = ['Total', 'Easy', 'Medium', 'Hard', 'Expert', 'Extreme'];

const useLeaderboardPage = () =>
{
  const [mode, setMode] = useState('Total');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
    const fetchData = async () =>
    {
      setLoading(true);
      try
      {
        const data = await getLeaderboard(mode);
        
        let validData = [];
        if (Array.isArray(data))
          validData = data;
        else if (data && Array.isArray(data.data))
          validData = data.data;

        const sorted = validData.sort((a, b) => (b.wins || 0) - (a.wins || 0));
        setPlayers(sorted);
      }
      catch (error)
      {
        console.error("Leaderboard Page Error:", error);
      } 
      finally
      {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode]);

  return {
    mode,
    setMode,
    players,
    loading,
    modes: MODES
  };
};

export default useLeaderboardPage;