import { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/api';

const useLeaderboardWidget = () =>
{
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
    const fetchLeaderboard = async () =>
    {
      try
      {
        if (!getLeaderboard)
          return;
        
        const data = await getLeaderboard('Total');
        
        let validData = [];
        if (Array.isArray(data))
          validData = data;
        else if (data && Array.isArray(data.data))
          validData = data.data;

        const sorted = [...validData].sort((a, b) => (b.wins || 0) - (a.wins || 0));
        setPlayers(sorted.slice(0, 5));
      }
      catch (err)
      {
        console.error(err);
      }
      finally
      {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return { players, loading };
};

export default useLeaderboardWidget;