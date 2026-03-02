import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/molecules/Navbar';
import Leaderboard from '../components/organisms/LeaderboardWidget';
import DifficultyModal from '../components/organisms/DifficultyModal';
import OnlineGameModal from '../components/molecules/OnlineGamePopup';
import SudokuBoard from '../components/organisms/SudokuBoard';
import { useAuth } from '../src/context/AuthContext'; 
import { startGame, createCombatRoom, joinRoom } from '../services/api';
import '../styles/Home.css';

const Home = () =>
{
    const navigate = useNavigate();
    const { user } = useAuth();

    const boardRef = useRef(null); 
    const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
    const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
    const [difficultyContext, setDifficultyContext] = useState(null);
    const [loading, setLoading] = useState(false);

    const [createdRoomId, setCreatedRoomId] = useState(null);
    const [isOpponentJoined, setIsOpponentJoined] = useState(false);
    const [playerRole, setPlayerRole] = useState(null);
    
    const [roomDifficulty, setRoomDifficulty] = useState("Medium");

    const [selectedCell, setSelectedCell] = useState(null);
    const [boardData, setBoardData] = useState(() =>
    {
        const initialBoard = Array.from({ length: 9 }, () =>
            Array.from({ length: 9 }, () => ({ value: 0, isFixed: false, isError: false }))
        );
        
        let count = 0;
        while (count < 18)
        {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            const val = Math.floor(Math.random() * 9) + 1;

            if (initialBoard[r][c].value === 0)
            {
                initialBoard[r][c] = { value: val, isFixed: true, isError: false };
                count++;
            }
        }
        return initialBoard;
    });

    const handleKeyDown = useCallback((e) =>
    {
        if (!selectedCell)
            return;
        const { r, c } = selectedCell;
        if (boardData[r][c].isFixed)
            return;

        if (e.key >= '1' && e.key <= '9')
        {
            const newBoard = [...boardData];
            newBoard[r][c] = { ...newBoard[r][c], value: parseInt(e.key) };
            setBoardData(newBoard);
        } 
        else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0')
        {
            const newBoard = [...boardData];
            newBoard[r][c] = { ...newBoard[r][c], value: 0 };
            setBoardData(newBoard);
        }
    }, [selectedCell, boardData]);

    useEffect(() =>
    {
        window.addEventListener('keydown', handleKeyDown);

        const handleClickOutside = (event) =>
        {
            if (boardRef.current && !boardRef.current.contains(event.target))
                setSelectedCell(null);
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () =>
        {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleKeyDown]);

    const handleCellClick = (r, c) =>
    {
        setSelectedCell({ r, c });
    };

    const getUserId = () =>
    {
        if (!user)
            return null;
        return user.id || (user.user && user.user.id);
    };

    const currentUserId = getUserId();
    const getCurrentUserName = () => {
        if (!user)
            return "Player";
        return user.display_name || user.username || (user.user && (user.user.display_name || user.user.username)) || "Player";
    };
    const currentUserName = getCurrentUserName();

    const handlePlayClick = (mode) =>
    {
        if (mode === 'online')
        {
            setIsOnlineModalOpen(true);
        }
        else
        {
            setDifficultyContext('OFFLINE');
            setIsDifficultyOpen(true);
        }
    };

    const handleOnlineCreateClick = () =>
    {
        setIsOnlineModalOpen(false);
        setDifficultyContext('ONLINE');
        setIsDifficultyOpen(true);
    };

    const handleJoinRoom = async (roomIdInput) =>
    {
        if (!roomIdInput)
            return alert("Please enter a Room ID");
        if (!currentUserId)
            return alert("User ID not found. Please log in.");

        setLoading(true);
        try
        {
            const data = await joinRoom(roomIdInput, currentUserId);
            setCreatedRoomId(data.roomId || data.room_id);
            setPlayerRole('guest');
            setIsOpponentJoined(true);
            setIsOnlineModalOpen(true);
        }
        catch (err)
        {
            console.error(err);
            alert("Error joining room: " + err.message);
            setIsOnlineModalOpen(false);
        }
        finally
        {
            setLoading(false);
        }
    };

    const handleDifficultySelect = async (difficulty) =>
    {
        setIsDifficultyOpen(false);
        setLoading(true);
        
        const difficultyMap = { 1: "Easy", 2: "Medium", 3: "Hard", 4: "Expert", 5: "Extreme" };
        const levelStr = difficultyMap[difficulty] || "Medium";

        try
        {
            if (difficultyContext === 'OFFLINE')
            {
                const gameData = await startGame('offline', difficulty);
                navigate('/offline-game', { state: { gameData, difficulty } });
            } 
            else if (difficultyContext === 'ONLINE')
            {
                if (!currentUserId)
                    throw new Error("User not authenticated");

                const data = await createCombatRoom(currentUserId, levelStr, currentUserName);
                const roomId = data.roomId || data.room_id || data.id;

                if (!roomId)
                    throw new Error("Failed to retrieve Room ID from server.");

                setCreatedRoomId(roomId);
                setPlayerRole('owner');
                setRoomDifficulty(levelStr);
                setIsOpponentJoined(false);
                setIsOnlineModalOpen(true);
            }
        }
        catch (error)
        {
            console.error("Game Start Error:", error);
            alert(error.message || "An error occurred while starting the game.");
        }
        finally
        {
            setLoading(false);
            setDifficultyContext(null);
        }
    };

    const handleCountdownComplete = () =>
    {
        setIsOnlineModalOpen(false);
        navigate(`/online-game/${createdRoomId}`, { 
            state: { 
                role: playerRole,
                difficulty: roomDifficulty
            } 
        });
    };

    return (
        <>
            <Navbar />
            <main className="hero-section">
                
                <div className="home-decorative-board" ref={boardRef}>
                    <SudokuBoard 
                        board={boardData} 
                        selectedCell={selectedCell} 
                        onCellClick={handleCellClick}
                        showError={false}
                    />
                </div>

                <div className="dashboard-container">
                    <div className="actions-column">
                        
                        <div className="mode-card online" onClick={() => handlePlayClick('online')}>
                            <div className="icon-wrapper">⚔️</div>
                            <div className="card-content">
                                <h2>Play Combat</h2>
                                <p>Challenge friends or random opponents</p>
                            </div>
                        </div>

                        <div className="mode-card offline" onClick={() => handlePlayClick('offline')}>
                            <div className="icon-wrapper">🗡️</div>
                            <div className="card-content">
                                <h2>Play Single</h2>
                                <p>Practice solo to improve your skills</p>
                            </div>
                        </div>

                    </div>
                    
                    <div className="leaderboard-wrapper">
                        <Leaderboard />
                    </div>
                </div>
            </main>

            <DifficultyModal 
                isOpen={isDifficultyOpen} 
                onClose={() => setIsDifficultyOpen(false)}
                onSelect={handleDifficultySelect}
                isLoading={loading}
            />
            
            <OnlineGameModal
                isOpen={isOnlineModalOpen}
                onClose={() => setIsOnlineModalOpen(false)}
                onCreate={handleOnlineCreateClick}
                onJoin={handleJoinRoom}
                isLoading={loading}
                createdRoomId={createdRoomId}
                isOpponentJoined={isOpponentJoined}
                onCountdownComplete={handleCountdownComplete}
            />
        </>
    );
};

export default Home;