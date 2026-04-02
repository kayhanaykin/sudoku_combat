import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import useGameLogic from '../hooks/useGameLogic';
import GameHeader from '../components/molecules/GameHeader';
import PlayerCard from '../components/molecules/PlayerCard';
import SudokuBoard from '../components/organisms/SudokuBoard';
import Numpad from '../components/molecules/Numpad';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import GameOverOverlay from '../components/organisms/GameOverOverlay';
import { getUserById } from '../services/userService'; 

const BASE_URL = '';

// STYLED COMPONENTS
const GameContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100vw;
    height: 100vh;
    padding-top: 5vmin;
    background-color: #f8f9fa;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
`;

const GameMainArea = styled.div`
    display: flex;
    align-items: flex-start; 
    justify-content: center;
    gap: 2vmin;
    width: 100%;

    @media (max-width: 768px)
    {
        flex-direction: column; 
        gap: 1.5vmin;
        align-items: center;
    }
`;

const BoardWrapper = styled.div`
    position: relative;
`;

const CenterToast = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(231, 76, 60, 0.95);
    color: white;
    padding: 15px 35px;
    border-radius: 12px;
    font-size: 1.8rem;
    font-weight: bold;
    z-index: 9999;
    transition: all 0.3s ease-in-out;
    pointer-events: none;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    text-align: center;

    opacity: ${props => 
    {
        if (props.$isVisible)
            return '1';
            
        return '0';
    }};

    visibility: ${props => 
    {
        if (props.$isVisible)
            return 'visible';
            
        return 'hidden';
    }};
`;

const ControlsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 1.5vmin;
`;

// COMPONENT DEFINITION
const OnlineGame = () => 
{
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const ws = useRef(null);
    const boardRef = useRef(null); 
    const controlsRef = useRef(null);

    let isOwner = false;
    if (location.state)
    {
        if (location.state.role === 'owner')
            isOwner = true;
    }
    
    const [players, setPlayers] = useState({ 
        you: { displayName: 'Loading...', username: '', avatar: null }, 
        opponent: { displayName: 'Waiting...', username: '', avatar: null } 
    });

    const getAvatarUrl = (avatarPath) => 
    {
        if (!avatarPath)
            return null;

        if (avatarPath.startsWith('http'))
            return avatarPath;

        return `${BASE_URL}${avatarPath}`;
    };

    const sendOnlineMove = (row, col, value) => 
    {
        if (ws.current)
        {
            if (ws.current.readyState === WebSocket.OPEN) 
            {
                let currentRole = 'guest';
                if (isOwner)
                    currentRole = 'owner';

                ws.current.send(JSON.stringify(
                {
                    event: 'move',
                    data: { roomId: roomId.toString(), role: currentRole, row, col, value }
                }));
            }
        }
    };

    const handleExitGame = async () => {
        if (isGameOver || gameResult)
        {
            navigate('/');
            return;
        }

        if (ws.current && ws.current.readyState === WebSocket.OPEN)
        {
            ws.current.send(JSON.stringify({
                event: 'move',
                data: { 
                    roomId: roomId.toString(), 
                    role: isOwner ? 'owner' : 'guest',
                    action: 'surrender'
                }
            }));
        }

        try
        {
            const diffMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Expert': 4, 'Extreme': 5 };
            await fetch('/api/stats/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: players.you.username || user?.username,
                    difficulty: diffMap[difficulty] || 2,
                    mode: 'online',
                    result: 'lose',
                    time_seconds: timer,
                    opponent: players.opponent.username
                })
            });
        }
        catch (error)
        {
            console.error("Failed to send exit stats", error);
        }

        navigate('/');
    };

    const { 
        board, timer, difficulty, lives, selectedCell, isGameOver,
        handleCellClick, handleInput, showError, errorMessage,
        setLives, updateBoardFromOpponent,
        setShowError, setErrorMessage,
        gameResult, setGameResult,
        setSelectedCell, 
        setStartTime,
        setDifficulty
    } = useGameLogic('online', sendOnlineMove, { 
        username: players.you.username || user?.username || '', 
        opponent: players.opponent.username || '',
        role: isOwner ? 'owner' : 'guest'
    });

    const [opponentLives, setOpponentLives] = useState(3);

    useEffect(() => {
        if (location.state && location.state.exactStartTime) {
            setStartTime(location.state.exactStartTime);
        }
    }, [location.state, setStartTime]);

    useEffect(() => 
    {
        const handleClickOutside = (event) => 
        {
            if (isGameOver)
                return;

            let clickedOnBoard = false;
            if (boardRef.current)
            {
                if (boardRef.current.contains(event.target))
                    clickedOnBoard = true;
            }

            let clickedOnControls = false;
            if (controlsRef.current)
            {
                if (controlsRef.current.contains(event.target))
                    clickedOnControls = true;
            }

            if (!clickedOnBoard)
            {
                if (!clickedOnControls)
                {
                    if (setSelectedCell)
                        setSelectedCell(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setSelectedCell, isGameOver]);

    useEffect(() => 
    {
        const fetchNames = async () => 
        {
            try 
            {
                const res = await fetch(`/api/room/game-state/${roomId}`);
                const data = await res.json();
                
                if (data.success) 
                {
                    const oData = await getUserById(data.ownerId);
                    
                    let oName = "Player 1";
                    if (oData.display_name)
                        oName = oData.display_name;
                    else if (oData.nickname)
                        oName = oData.nickname;
                    else if (oData.username)
                        oName = oData.username;

                    let oUsername = '';
                    if (oData.username)
                        oUsername = oData.username;

                    const oAvatar = getAvatarUrl(oData.avatar);
                    
                    let gName = 'Waiting...';
                    let gAvatar = null;
                    
                    if (data.guestId) 
                    {
                        const gData = await getUserById(data.guestId);
                        
                        gName = "Player 2";
                        if (gData.display_name)
                            gName = gData.display_name;
                        else if (gData.nickname)
                            gName = gData.nickname;
                        else if (gData.username)
                            gName = gData.username;

                        let guestUsername = '';
                        if (gData.username)
                            guestUsername = gData.username;
                            
                        gAvatar = getAvatarUrl(gData.avatar);

                        if (isOwner)
                        {
                            setPlayers({ 
                                you: { displayName: oName, username: oUsername, avatar: oAvatar }, 
                                opponent: { displayName: gName, username: guestUsername, avatar: gAvatar } 
                            });
                        }
                        else
                        {
                            setPlayers({ 
                                you: { displayName: gName, username: guestUsername, avatar: gAvatar }, 
                                opponent: { displayName: oName, username: oUsername, avatar: oAvatar } 
                            });
                        }
                        return;
                    }

                    if (isOwner)
                    {
                        setPlayers({ 
                            you: { displayName: oName, username: oUsername, avatar: oAvatar }, 
                            opponent: { displayName: gName, username: '', avatar: gAvatar } 
                        });
                    }
                    else
                    {
                        setPlayers({ 
                            you: { displayName: gName, username: '', avatar: gAvatar }, 
                            opponent: { displayName: oName, username: oUsername, avatar: oAvatar } 
                        });
                    }
                }
            } 
            catch(e) 
            {
                setPlayers({ 
                    you: { displayName: 'You', username: user?.username || '', avatar: null }, 
                    opponent: { displayName: 'Opponent', username: '', avatar: null } 
                });
            }
        };
        fetchNames();
    }, [roomId, isOwner, user?.username]);

    useEffect(() => 
    {
        if (!roomId)
            return;
            
        ws.current = new WebSocket(`wss://${window.location.host}/api/play`);

        ws.current.onopen = () => 
        {
            ws.current.send(JSON.stringify({ 
                event: 'join_room', 
                data: { roomId: roomId.toString() } 
            }));
        };

        ws.current.onmessage = (event) => 
        {
            const message = JSON.parse(event.data);
                    
            let myRole = 'guest';
            if (isOwner)
                myRole = 'owner';

            switch (message.event) 
            {
                case 'sync_game':
                    if (message.gameState) 
                    {
                        if (message.gameState.startTime)
                            setStartTime(new Date(message.gameState.startTime).getTime());
                        else
                            setStartTime(location.state.exactStartTime);

                        if (message.gameState.difficulty)
                            setDifficulty(message.gameState.difficulty);

                        if (message.gameState.currBoard)
                        {
                            updateBoardFromOpponent(message.gameState.currBoard);
                            
                            setPlayers(prev => 
                            {
                                if (isOwner) 
                                {
                                    if (prev.opponent.displayName === 'Waiting...')
                                    {
                                        if (message.gameState.guestId)
                                        {
                                            getUserById(message.gameState.guestId).then(gData => 
                                            {
                                                let newGuestName = gData.username;
                                                let newGuestUsername = gData.username || '';
                                                if (gData.display_name)
                                                    newGuestName = gData.display_name;
                                                else if (gData.nickname)
                                                    newGuestName = gData.nickname;

                                                const newGuestAvatar = getAvatarUrl(gData.avatar);
                                                
                                                setPlayers(p => ({ 
                                                    ...p, 
                                                    opponent: { displayName: newGuestName, username: newGuestUsername, avatar: newGuestAvatar } 
                                                }));
                                            });
                                        }
                                    }
                                }
                                return prev;
                            });
                        }
                    }
                    
                    if (isOwner)
                    {
                        setLives(message.ownerHealth);
                        setOpponentLives(message.guestHealth);
                    }
                    else
                    {
                        setLives(message.guestHealth);
                        setOpponentLives(message.ownerHealth);
                    }

                    if (message.valid === false) 
                    {
                        if (message.moveBy === myRole)
                        {
                            setErrorMessage("Wrong Move!");
                            setShowError(true);
                            setTimeout(() => setShowError(false), 1500);
                        }
                    }

                    if (message.winner || message.loser) 
                    {
                        let isMeWinner = false;
                        
                        if (message.winner)
                        {
                            if (message.winner === myRole)
                                isMeWinner = true;
                        }
                        else if (message.loser)
                        {
                            if (message.loser !== myRole)
                                isMeWinner = true;
                        }

                        let delay = 0;
                        if (message.valid === false)
                        {
                            if (message.moveBy === myRole)
                                delay = 1500;
                        }

                        let finalRes = 'lose';
                        if (isMeWinner)
                            finalRes = 'win';

                        setTimeout(() => 
                        {
                            setGameResult(prev => 
                            {
                                if (prev)
                                    return prev;
                                return finalRes;
                            });
                        }, delay);
                    }
                    break;
                
                case 'player_left':
                    setGameResult(prev => 
                    {
                        if (prev)
                            return prev;
                        return 'win';
                    });
                    break;
                
                case 'error':
                    console.error('Server Error:', message.message);
                    break;

                default:
                    break;
            }
        };

        return () => 
        { 
            if (ws.current) 
                ws.current.close(); 
        };
    }, [roomId, isOwner]);

    let isGameDisabled = false;
    if (isGameOver)
        isGameDisabled = true;
    else if (gameResult !== null)
        isGameDisabled = true;

    return (
        <GameContainer>
            
            <CenterToast $isVisible={showError}>
                {errorMessage}
            </CenterToast>

            <GameOverOverlay result={gameResult} />

            <BackToHomeLink onClick={handleExitGame} />
            
            <GameHeader timer={timer} difficulty={difficulty} />

            <GameMainArea>
                
                <PlayerCard 
                    title={players.you.displayName}
                    username={players.you.username}
                    avatar={players.you.avatar} 
                    lives={lives} 
                />

                <BoardWrapper ref={boardRef}>
                    <SudokuBoard 
                        board={board}
                        selectedCell={selectedCell}
                        onCellClick={handleCellClick}
                        isGameOver={isGameDisabled}
                        showError={showError} 
                        errorMessage={errorMessage}
                    />
                </BoardWrapper>

                <PlayerCard 
                    title={players.opponent.displayName}
                    username={players.opponent.username}
                    avatar={players.opponent.avatar} 
                    lives={opponentLives} 
                    align="right" 
                />
                
            </GameMainArea>

            <ControlsWrapper ref={controlsRef}>
                <Numpad 
                    onNumberClick={handleInput} 
                    disabled={isGameDisabled} 
                />
            </ControlsWrapper>

        </GameContainer>
    );
};

export default OnlineGame;