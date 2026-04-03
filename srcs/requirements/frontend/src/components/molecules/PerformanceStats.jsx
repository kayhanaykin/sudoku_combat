import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const CardContainer = styled.div`
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 25px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    width: 100%;
    margin-top: 20px;
`;

const SectionTitle = styled.h3`
    font-size: 1.2rem;
    padding-left: 10px;
    padding-bottom: 5px;
    text-align: left;
    font-weight: 800;
    color: var(--dark-green, #14532d);
    margin-bottom: 25px;
    letter-spacing: -0.5px;
    margin-top: 0;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
`;

const ModeSwitch = styled.div`
    display: inline-flex;
    gap: 8px;
`;

const ModeButton = styled.button`
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    background: ${props => 
    {
        if (props.$isActive)
            return '#14532d';
            
        return '#fff';
    }};

    color: ${props => 
    {
        if (props.$isActive)
            return '#fff';
            
        return '#374151';
    }};

    border-color: ${props => 
    {
        if (props.$isActive)
            return '#14532d';
            
        return '#d1d5db';
    }};
`;

const TableWrapper = styled.div`
    width: 100%;
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-family: 'Inter', sans-serif;

    th, td 
    {
        text-align: center;
        vertical-align: middle;
        padding: 15px;
        color: #374151;
        border-bottom: 1px solid #f3f4f6;
        font-size: 0.95rem;
    }
`;

const DiffCell = styled.td`
    display: flex !important;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-bottom: none !important;
    font-weight: 600;
`;

const DiffDot = styled.span`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    
    background-color: ${props => 
    {
        switch (props.$diffName.toLowerCase())
        {
            case 'easy':
                return '#4ade80';
            case 'medium':
                return '#facc15';
            case 'hard':
                return '#ec7928';
            case 'expert':
                return '#f03939';
            case 'extreme':
                return '#880000';
            default:
                return '#cccccc';
        }
    }};
`;

const WinRateContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
`;

const ProgressBarBg = styled.div`
    flex: 0 1 100px; 
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
`;

const ProgressFill = styled.div`
    height: 100%;
    background-color: #4ade80;
    width: ${props => props.$width}%;
    transition: width 0.5s ease-out;
`;

const TotalRow = styled.tr`
    background-color: #f0fdf4 !important;
    font-weight: bold;
    color: #14532d;
`;

// COMPONENT DEFINITION
const PerformanceStats = ({ username }) =>
{
    const [statsData, setStatsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedMode, setSelectedMode] = useState('online');

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
                const response = await fetch(`/api/stats/${encodeURIComponent(username)}`);
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
        if (!seconds || seconds === 0)
            return '-';
            
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        
        return `${m}:${s}`;
    };

    const detailedStats = difficulties.map(diff =>
    {
        let diffData = {};
        if (statsData[diff.id])
            diffData = statsData[diff.id];

        let modeStats = {};
        if (diffData[selectedMode])
            modeStats = diffData[selectedMode];

        let won = 0;
        if (modeStats.wins)
            won = modeStats.wins;

        let losses = 0;
        if (modeStats.losses)
            losses = modeStats.losses;

        const played = won + losses;

        let winRate = 0;
        if (played > 0)
            winRate = Math.round((won / played) * 100);

        let bestTimeSeconds = null;
        const rawBestTime = modeStats.best_time_seconds ?? modeStats.best_time ?? null;
        if (rawBestTime !== null && rawBestTime !== undefined)
        {
            const parsed = Number(rawBestTime);
            if (!Number.isNaN(parsed) && parsed >= 0)
                bestTimeSeconds = parsed;
        }

        const bestTime = formatTime(bestTimeSeconds);

        return { name: diff.name, played, won, winRate, bestTime };
    });

    const totalPlayed = detailedStats.reduce((acc, curr) => acc + curr.played, 0);
    const totalWon = detailedStats.reduce((acc, curr) => acc + curr.won, 0);
    
    let totalWinRate = 0;
    if (totalPlayed > 0)
        totalWinRate = Math.round((totalWon / totalPlayed) * 100);

    if (loading)
        return <CardContainer>Loading statistics...</CardContainer>;

    return (
        <CardContainer>
            
            <HeaderRow>
                <SectionTitle>Statistics</SectionTitle>
                <ModeSwitch>
                    <ModeButton
                        $isActive={selectedMode === 'online'}
                        onClick={() => setSelectedMode('online')}
                    >
                        Online
                    </ModeButton>
                    <ModeButton
                        $isActive={selectedMode === 'offline'}
                        onClick={() => setSelectedMode('offline')}
                    >
                        Offline
                    </ModeButton>
                </ModeSwitch>
            </HeaderRow>
            
            <TableWrapper>
                <Table>
                    
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
                                <DiffCell>
                                    <DiffDot $diffName={row.name} />
                                    {row.name}
                                </DiffCell>
                                <td>
                                    {row.played}
                                </td>
                                <td>
                                    {row.won}
                                </td>
                                <td>
                                    <WinRateContainer>
                                        <span style={{ width: '40px' }}>{row.winRate}%</span>
                                        <ProgressBarBg>
                                            <ProgressFill $width={row.winRate} />
                                        </ProgressBarBg>
                                    </WinRateContainer>
                                </td>
                                <td>
                                    {row.bestTime}
                                </td>
                            </tr>
                        ))}
                        
                        <TotalRow>
                            <td><strong>TOTAL</strong></td>
                            <td><strong>{totalPlayed}</strong></td>
                            <td><strong>{totalWon}</strong></td>
                            <td>
                                <WinRateContainer>
                                    <span style={{ width: '40px' }}>{totalWinRate}%</span>
                                    <ProgressBarBg>
                                        <ProgressFill $width={totalWinRate} />
                                    </ProgressBarBg>
                                </WinRateContainer>
                            </td>
                            <td>-</td>
                        </TotalRow>
                        
                    </tbody>
                    
                </Table>
            </TableWrapper>
            
        </CardContainer>
    );
};

export default PerformanceStats;