import React from 'react';
import '../../styles/PerformanceStats.css';

const PerformanceStats = ({ stats }) =>
{
    const difficulties = ['Easy', 'Medium', 'Hard', 'Expert', 'Extreme'];

    const detailedStats = difficulties.map(diff =>
    {
        const played = stats?.ranks?.[diff.toLowerCase()]?.played || 0;
        const won = stats?.ranks?.[diff.toLowerCase()]?.won || 0;
        const bestTime = stats?.ranks?.[diff.toLowerCase()]?.bestTime || '-';
        const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
        return { name: diff, played, won, winRate, bestTime };
    });

    const totalPlayed = detailedStats.reduce((acc, curr) => acc + curr.played, 0);
    const totalWon = detailedStats.reduce((acc, curr) => acc + curr.won, 0);
    const totalWinRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

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