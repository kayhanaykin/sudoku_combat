import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { makeMove, reportHintUsed, fetchRoomState } from '../services/api';

const MAX_HINTS = 3;
const OFFLINE_SESSION_KEY = 'sudoku_offline_session';

const saveOfflineSession = (data) =>
{
    try { sessionStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(data)); }
    catch (_) {}
};

const loadOfflineSession = () =>
{
    try
    {
        const raw = sessionStorage.getItem(OFFLINE_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch (_) { return null; }
};

export const clearOfflineSession = () =>
{
    try { sessionStorage.removeItem(OFFLINE_SESSION_KEY); }
    catch (_) {}
};

const EMPTY_BOARD = Array(9).fill(null).map(() => Array(9).fill(
{
    value: 0,
    isFixed: false,
    isError: false
}));

const DIFFICULTY_LEVELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert', 5: 'Extreme' };

const formatBoardFromData = (rawBoard) => 
{
    if (!rawBoard)
        return [];
    return rawBoard.map(row => row.map(num => (
    {
        value: num,
        isFixed: num !== 0,
        isError: false
    })));
};

const formatTime = (totalSeconds) => 
{
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const useGameLogic = (mode = 'offline', sendOnlineMove = null, playersInfo = { username: '', opponent: '' }) => 
{    
    const location = useLocation();
    const navigate = useNavigate();
    const { roomId: urlRoomId } = useParams();

    const [board, setBoard] = useState(EMPTY_BOARD);
    const [gameId, setGameId] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);

    const [startTime, setStartTime] = useState(null);
    const [seconds, setSeconds] = useState(0);
    const [difficulty, setDifficulty] = useState("Medium");
    
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [lives, setLives] = useState(3);
    const [hintsRemaining, setHintsRemaining] = useState(MAX_HINTS);
    const [isGameOver, setIsGameOver] = useState(false);
    
    const [isHintModalOpen, setIsHintModalOpen] = useState(false);
    const [hintData, setHintData] = useState(null);

    const [gameResult, setGameResult] = useState(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const hasReportedStats = useRef(false);

    useEffect(() =>
    {
        if (mode === 'offline')
        {
            if (location.state && location.state.gameData)
            {
                const { gameData, difficulty: diffLevel, exactStartTime } = location.state;

                let resolvedDifficulty = 'Medium';
                if (diffLevel)
                {
                    resolvedDifficulty = DIFFICULTY_LEVELS[diffLevel] || diffLevel || 'Medium';
                    setDifficulty(resolvedDifficulty);
                }

                const id = gameData.game_id || gameData.gameId;
                if (id)
                {
                    setGameId(id);

                    saveOfflineSession({
                        gameId: id,
                        userId: playersInfo?.userId ?? 'offline',
                        username: playersInfo?.username ?? null,
                        difficulty: resolvedDifficulty,
                        startTime: exactStartTime || Date.now()
                    });

                    const uidForFetch = playersInfo?.userId ?? 'offline';
                    fetch(`/api/room/game-state/${id}?userId=${encodeURIComponent(uidForFetch)}`)
                        .then(r => r.json())
                        .then(data =>
                        {
                            if (!data.success)
                                return;
                            if (data.currBoard)
                                setBoard(formatBoardFromData(data.currBoard));
                            if (data.health)
                                setLives(Number(data.health[0]));
                            if (data.hintsUsed !== undefined)
                                setHintsRemaining(Math.max(0, MAX_HINTS - Number(data.hintsUsed)));
                            if (data.gameStartTime)
                                setStartTime(new Date(data.gameStartTime).getTime());
                        })
                        .catch(err => console.error('Failed to sync offline state:', err))
                        .finally(() => setIsHydrated(true));
                }
                else
                {
                    const rawBoard = gameData.board || gameData.current_board;
                    if (rawBoard)
                        setBoard(formatBoardFromData(rawBoard));
                    if (gameData.lives !== undefined)
                        setLives(Number(gameData.lives));
                    if (gameData.hintsUsed !== undefined)
                        setHintsRemaining(Math.max(0, MAX_HINTS - gameData.hintsUsed));
                    setIsHydrated(true);
                }
            }
            else
            {
                const saved = loadOfflineSession();
                if (saved && saved.gameId)
                {
                    const uid = saved.userId ?? 'offline';
                    fetchRoomState(saved.gameId, uid)
                        .then(data =>
                        {
                            if (!data || !data.success || data.status !== 'playing' || !data.currBoard)
                            {
                                clearOfflineSession();
                                navigate('/');
                                return;
                            }
                            setGameId(saved.gameId);
                            setBoard(formatBoardFromData(data.currBoard));
                            if (Array.isArray(data.health) && data.health.length > 0)
                                setLives(Number(data.health[0]));
                            if (data.hintsUsed !== undefined)
                                setHintsRemaining(Math.max(0, MAX_HINTS - Number(data.hintsUsed)));
                            if (data.difficulty)
                                setDifficulty(DIFFICULTY_LEVELS[data.difficulty] || data.difficulty || saved.difficulty || 'Medium');
                            else if (saved.difficulty)
                                setDifficulty(saved.difficulty);

                            let resolvedStart = null;
                            if (data.gameStartTime)
                            {
                                const ts = new Date(data.gameStartTime).getTime();
                                if (!Number.isNaN(ts))
                                    resolvedStart = ts;
                            }
                            if (!resolvedStart && saved.startTime)
                                resolvedStart = saved.startTime;
                            if (resolvedStart)
                                setStartTime(resolvedStart);
                        })
                        .catch(() =>
                        {
                            clearOfflineSession();
                            navigate('/');
                        })
                        .finally(() => setIsHydrated(true));
                }
            }
        }
        else if (mode === 'online')
        {
            let diffLevel = null;
            let role = null;

            if (location.state)
            {
                diffLevel = location.state.difficulty;
                role = location.state.role;
            }

            const roomId = urlRoomId;

            if (roomId)
            {
                setGameId(roomId);

                const fetchGameState = async () => 
                {
                    try 
                    {
                        const uid = playersInfo?.userId ?? '';
                        const response = await fetch(`/api/room/game-state/${roomId}?userId=${encodeURIComponent(uid)}`);
                        const data = await response.json();

                        if (data.success)
                        {
                            if (data.currBoard)
                                setBoard(formatBoardFromData(data.currBoard));

                            const currentRole = playersInfo?.role || 'guest';
                            if (data.health)
                            {
                                const h = currentRole === 'owner'
                                    ? data.health[0] : data.health[1];
                                setLives(Number(h));
                            }

                            if (data.difficulty)
                                setDifficulty(data.difficulty);

                            if (data.startTime)
                                setStartTime(data.startTime);
                        }
                    }
                    catch (error) 
                    {
                        console.error("Error fetching online board:", error);
                    }
                };

                fetchGameState();
            }

            if (diffLevel)
                setDifficulty(diffLevel);
        }
    }, [location, mode, urlRoomId]);

    useEffect(() =>
    {
        if (!startTime || isGameOver)
            return;

        const tick = () =>
        {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setSeconds(elapsed < 0 ? 0 : elapsed);
        };
        tick();
        const interval = setInterval(tick, 1000);

        return () => clearInterval(interval);

    }, [startTime, isGameOver]);

    const handleCellClick = (r, c) => 
    {
        if (isGameOver)
            return;
        setSelectedCell({ r, c });
    };

    const moveSelection = (key) => 
    {
        let { r, c } = selectedCell;
        
        if (key === 'ArrowUp')
            r = Math.max(0, r - 1);
        if (key === 'ArrowDown')
            r = Math.min(8, r + 1);
        if (key === 'ArrowLeft')
            c = Math.max(0, c - 1);
        if (key === 'ArrowRight')
            c = Math.min(8, c + 1);
        
        setSelectedCell({ r, c });
    };

    const handleInput = async (number) => 
    {
        if (!selectedCell || isGameOver)
            return;
        
        const { r, c } = selectedCell;
        
        if (board[r][c].isFixed)
            return;

        if (number === 0) 
        {
            setBoard(prev => 
            {
                const newBoard = [...prev];
                newBoard[r] = [...newBoard[r]];
                newBoard[r][c] = { ...newBoard[r][c], value: 0, isError: false };
                return newBoard;
            });
            
            if (mode === 'online' && sendOnlineMove)
                sendOnlineMove(r, c, 0);
            return;
        }

        if (mode === 'offline') 
        {
            try 
            {
                const response = await makeMove(gameId, r, c, number);
                
                if (response.result === 'CORRECT' || response.result === 'WIN') 
                {
                    setBoard(prev => 
                    {
                        const newBoard = [...prev];
                        newBoard[r] = [...newBoard[r]];
                        newBoard[r][c] = { ...newBoard[r][c], value: number, isError: false };
                        return newBoard;
                    });
                    
                    setShowError(false);
                    
                    if (response.result === 'WIN') 
                    {
                        setIsGameOver(true);
                        setGameResult('win');
                    }
                }
                else if (response.result === 'WRONG') 
                {
                    setLives(response.lives);
                    setErrorMessage("Wrong Move!");
                    setShowError(true);
                    setTimeout(() => setShowError(false), 1500);

                    if (response.lives <= 0) 
                    {
                        setIsGameOver(true);
                        setGameResult('lose');
                    }
                }
                else if (response.result === 'GAME_OVER' || response.status === 'LOST') 
                {
                    setLives(0);
                    setIsGameOver(true);
                    setGameResult('lose');
                }
            } 
            catch (error) 
            {
                console.error(error);
            }
        }
        else if (mode === 'online') 
        {
            setBoard(prev => 
            {
                const newBoard = [...prev];
                newBoard[r] = [...newBoard[r]];
                newBoard[r][c] = { ...newBoard[r][c], value: number, isError: false };
                return newBoard;
            });
            
            setShowError(false);
            
            if (sendOnlineMove)
                sendOnlineMove(r, c, number);
        }
    };

    useEffect(() => 
    {
        const handleKeyDown = (e) => 
        {
            if (!selectedCell || isGameOver)
                return;
            
            if (e.key >= '1' && e.key <= '9')
            {
                handleInput(parseInt(e.key));
            }
            else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0')
            {
                handleInput(0);
            }
            else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) 
            {
                e.preventDefault();
                moveSelection(e.key);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, board, gameId, lives, isGameOver]);

    const handleHint = async () => 
    {
        if (isGameOver)
            return;

        if (hintsRemaining <= 0)
        {
            setErrorMessage("No hints remaining!");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        try
        {
            const simpleGrid = board.map(row => row.map(cell => cell.value));

            const response = await fetch('/api/game/hint', 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grid: simpleGrid })
            });

            const data = await response.json();

            if (!response.ok || data.success === false)
            {
                setErrorMessage(data.error || ("Server Error: " + response.status));
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
                return;
            }

            if (data.found)
            {
                setHintData(data);
                setIsHintModalOpen(true);
                setSelectedCell({ r: data.row, c: data.col });
                setHintsRemaining(prev => prev - 1);
                if (mode === 'offline' && gameId)
                    reportHintUsed(gameId);
            }
            else
            {
                setErrorMessage("No hint found");
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
            }
        }
        catch (error)
        {
            console.error("Data processing error:", error);
            setErrorMessage("Data processing error!");
            setShowError(true);
        }
    };

    const applyHint = async () => 
    {
        if (!hintData)
            return;
        
        const { row, col, value } = hintData;

        setBoard(prev => 
        {
            const newBoard = [...prev];
            newBoard[row] = [...newBoard[row]]; 
            newBoard[row][col] = 
            { 
                ...newBoard[row][col], 
                value: value,
                isFixed: false,
                isError: false
            };
            return newBoard;
        });

        setIsHintModalOpen(false);
        setHintData(null);

        if (mode === 'offline' && gameId)
        {
            try
            {
                await makeMove(gameId, row, col, value);
            }
            catch (error)
            {
                console.error(error);
            }
        }
        else if (mode === 'online' && sendOnlineMove)
        {
            sendOnlineMove(row, col, value);
        }
    };

    const updateBoardFromOpponent = (newRawBoard) => 
    {
        if (!newRawBoard)
            return;
        setBoard(formatBoardFromData(newRawBoard));
    };

    useEffect(() =>
    {
        if (mode === 'offline' && gameResult)
            clearOfflineSession();
    }, [mode, gameResult]);

    useEffect(() =>
    {
        if (gameResult && !hasReportedStats.current)
        {
            if (!playersInfo || !playersInfo.username || !playersInfo.userId)
                return;

            hasReportedStats.current = true; 

            const reportStats = async () => 
            {
                const diffMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Expert': 4, 'Extreme': 5 };
                const diffInt = diffMap[difficulty] || 2;
                const modeStr = mode === 'online' ? 'online' : 'offline';

                const payload = 
                {
                    user_id: playersInfo.userId,
                    username: playersInfo.username,
                    difficulty: diffInt,
                    mode: modeStr,
                    result: gameResult,
                    time_seconds: seconds
                };

                if (mode === 'online' && playersInfo.opponent)
                    payload.opponent = playersInfo.opponent;

                try 
                {
                    const response = await fetch('/api/stats/report', 
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!response.ok)
                        console.error("Stats API Error:", response.status);
                } 
                catch (error) 
                {
                    console.error("Failed to send stats:", error);
                }
            };

            reportStats();
        }
    }, [gameResult, playersInfo?.username, playersInfo?.userId, playersInfo?.opponent, difficulty, mode, seconds]);

    return {
        board, timer: formatTime(seconds), seconds, difficulty, lives, hintsRemaining, selectedCell, isGameOver,
        showError, errorMessage, isHintModalOpen, hintData,
        handleCellClick, handleInput, handleHint, applyHint,
        setIsHintModalOpen, setHintData, setBoard, setLives,
        updateBoardFromOpponent, setShowError, setErrorMessage,
        gameResult, setGameResult,
        setSelectedCell,
        setStartTime,
        setDifficulty,
        gameId
    };
};

export default useGameLogic;