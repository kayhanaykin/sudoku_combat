import React, { useState, useEffect } from 'react';
import '../../styles/PerformanceStats.css';

const PerformanceStats = ({ username }) =>
{
    const [statsData, setStatsData] = useState({});
    const [loading, setLoading] = useState(true);

    const difficulties = [
        { id: 1, name: 'Easy' },
        { id: 2, name: 'Medium' },
        { id: 3, name: 'Hard' },
        { id: 4, name: 'Expert' },
        { id: 5, name: 'Extreme' }
    ];

    useEffect(() => 
    {
        if (!username)
        {
            setLoading(false);
            return;
        }

        const fetchStats = async () => 
        {
            try
            {
                const response = await fetch(`/api/stats/${username}`);
                if (response.ok) 
                {
                    const data = await response.json();
                    
                    if (data && data.difficulties)
                        setStatsData(data.difficulties);
                    else 
                        setStatsData({}); 
                }
            }
            catch (error)
            {
                console.error("Failed to fetch stats", error);
                setStatsData({});
            }
            finally
            {
                setLoading(false);
            }
        };

        fetchStats();
    }, [username]);

    const formatTime = (seconds) => 
    {
        if (seconds === null || seconds === undefined || seconds === 0)
            return '-';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const detailedStats = difficulties.map(diff =>
    {
        const diffData = statsData[diff.id] || {};
        
        const onlineStats = diffData.online || {};
        const offlineStats = diffData.offline || {};

        const onlineWins = onlineStats.wins || 0;
        const offlineWins = offlineStats.wins || 0;
        const onlineLosses = onlineStats.losses || 0;
        const offlineLosses = offlineStats.losses || 0;

        const won = onlineWins + offlineWins;
        const losses = onlineLosses + offlineLosses;
        const played = won + losses;

        const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

        let bestTimeSeconds = null;
        
        if (onlineStats.best_time_seconds)
            bestTimeSeconds = onlineStats.best_time_seconds;
            
        if (offlineStats.best_time_seconds)
        {
            if (bestTimeSeconds === null || offlineStats.best_time_seconds < bestTimeSeconds)
                bestTimeSeconds = offlineStats.best_time_seconds;
        }

        const bestTime = formatTime(bestTimeSeconds);

        return { name: diff.name, played, won, winRate, bestTime };
    });

    const totalPlayed = detailedStats.reduce((acc, curr) => acc + curr.played, 0);
    const totalWon = detailedStats.reduce((acc, curr) => acc + curr.won, 0);
    const totalWinRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

    if (loading)
        return <div className="profile-card-base o-stats-section">Loading statistics...</div>;

    return (
        <div className="profile-card-base o-stats-section">
            <h3 className="section-title">Statistics</h3>
            <div className="stats-table-wrapper">
                <table className="stats-table">
                    <thead>
                        <tr>
                            <th>Difficulty</th>
                            <th>Games Played</th>
                            <th>Won</th>
                            <th>Win Rate</th>
                            <th>Best Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailedStats.map((row) => (
                            <tr key={row.name}>
                                <td className="diff-cell">
                                    <span className={`diff-dot ${row.name.toLowerCase()}`}></span>
                                    {row.name}
                                </td>
                                <td>{row.played}</td>
                                <td>{row.won}</td>
                                <td>
                                    <div className="win-rate-bar-container">
                                        <span style={{ width: '40px' }}>{row.winRate}%</span>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${row.winRate}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td>{row.bestTime}</td>
                            </tr>
                        ))}
                        <tr className="total-row">
                            <td><strong>TOTAL</strong></td>
                            <td><strong>{totalPlayed}</strong></td>
                            <td><strong>{totalWon}</strong></td>
                            <td>
                                <div className="win-rate-bar-container">
                                    <span style={{ width: '40px' }}>{totalWinRate}%</span>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${totalWinRate}%` }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PerformanceStats;