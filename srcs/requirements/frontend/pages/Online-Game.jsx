import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useGameLogic from '../src/hooks/useGameLogic';
import GameHeader from '../components/molecules/GameHeader';
import PlayerCard from '../components/molecules/PlayerCard';
import SudokuBoard from '../components/organisms/SudokuBoard';
import Numpad from '../components/molecules/Numpad';
import HintModal from '../components/organisms/HintModal';
import ActionBtn from '../components/atoms/ActionBtn';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import GameOverOverlay from '../components/organisms/GameOverOverlay';
import { getUserById } from '../services/userService'; 
import '../styles/Game.css';

const BASE_URL = 'https://localhost:8443';

const OnlineGame = () => 
{
    const { roomId } = useParams();
    const location = useLocation();
    
    const ws = useRef(null);
    const boardRef = useRef(null); 

    const isOwner = location.state?.role === 'owner';
    
    const [players, setPlayers] = useState({ 
        you: { name: 'Loading...', avatar: null }, 
        opponent: { name: 'Waiting...', avatar: null } 
    });

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath)
            return null;
        return avatarPath.startsWith('http') ? avatarPath : `${BASE_URL}${avatarPath}`;
    };

    const sendOnlineMove = (row, col, value) => 
    {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) 
        {
            ws.current.send(JSON.stringify(
            {
                event: 'move',
                data: { roomId: roomId.toString(), role: isOwner ? 'owner' : 'guest', row, col, value }
            }));
        }
    };

    const { 
        board, timer, difficulty, lives, selectedCell, isGameOver,
        handleCellClick, handleInput, showError, errorMessage,
        isHintModalOpen, hintData, handleHint, applyHint,
        setLives, updateBoardFromOpponent,
        setShowError, setErrorMessage,
        gameResult, setGameResult,
        setSelectedCell
    } = useGameLogic('online', sendOnlineMove); 

    const [opponentLives, setOpponentLives] = useState(3);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (boardRef.current && !boardRef.current.contains(event.target))
            {
                const isControlClick = event.target.closest('.controls-area') || event.target.closest('.numpad-grid');
                if (!isControlClick && setSelectedCell)
                {
                    setSelectedCell(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setSelectedCell]);

    useEffect(() => 
    {
        const fetchNames = async () => 
        {
            try 
            {
                const res = await fetch(`https://localhost:8443/api/room/game-state/${roomId}`);
                const data = await res.json();
                
                if (data.success) 
                {
                    const oData = await getUserById(data.ownerId);
                    const oName = oData.display_name || oData.nickname || oData.username || "Player 1";
                    const oAvatar = getAvatarUrl(oData.avatar);
                    
                    let gName = 'Waiting...';
                    let gAvatar = null;
                    if (data.guestId) 
                    {
                        const gData = await getUserById(data.guestId);
                        gName = gData.display_name || gData.nickname || gData.username || "Player 2";
                        gAvatar = getAvatarUrl(gData.avatar);
                    }

                    if (isOwner)
                    {
                        setPlayers({ you: { name: oName, avatar: oAvatar }, opponent: { name: gName, avatar: gAvatar } });
                    }
                    else
                    {
                        setPlayers({ you: { name: gName, avatar: gAvatar }, opponent: { name: oName, avatar: oAvatar } });
                    }
                }
            } 
            catch(e) 
            {
                setPlayers({ you: { name: 'You', avatar: null }, opponent: { name: 'Opponent', avatar: null } });
            }
        };
        fetchNames();
    }, [roomId, isOwner]);

    useEffect(() => 
    {
        if (!roomId)
            return;
        ws.current = new WebSocket('wss://localhost:8443/api/play');

        ws.current.onopen = () => 
        {
            ws.current.send(JSON.stringify({ event: 'join_room', data: { roomId: roomId.toString() } }));
        };

        ws.current.onmessage = (event) => 
        {
            const message = JSON.parse(event.data);
            const myRole = isOwner ? 'owner' : 'guest';

            switch (message.event) 
            {
                case 'sync_game':
                    if (message.gameState && message.gameState.currBoard) 
                    {
                        updateBoardFromOpponent(message.gameState.currBoard);
                        
                        setPlayers(prev => 
                        {
                            if (isOwner && prev.opponent.name === 'Waiting...' && message.gameState.guestId) 
                            {
                                getUserById(message.gameState.guestId).then(gData => 
                                {
                                    const newGuestName = gData.display_name || gData.nickname || gData.username;
                                    const newGuestAvatar = getAvatarUrl(gData.avatar);
                                    setPlayers(p => ({ ...p, opponent: { name: newGuestName, avatar: newGuestAvatar } }));
                                });
                            }
                            return prev;
                        });
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

                    if (message.valid === false && message.moveBy === myRole) 
                    {
                        setErrorMessage("Wrong Move!");
                        setShowError(true);
                        setTimeout(() => setShowError(false), 1500);
                    }

                    if (message.winner || message.loser) 
                    {
                        let isMeWinner = false;
                        if (message.winner)
                            isMeWinner = (message.winner === myRole);
                        else if (message.loser)
                            isMeWinner = (message.loser !== myRole);

                        const delay = (message.valid === false && message.moveBy === myRole) ? 1500 : 0;
                        setTimeout(() => setGameResult(prev => prev ? prev : (isMeWinner ? 'win' : 'lose')), delay);
                    }
                    break;
                
                case 'player_left':
                    setGameResult(prev => prev ? prev : 'win');
                    break;
                
                case 'error':
                    console.error('Server Error:', message.message);
                    break;

                default:
                    break;
            }
        };

        return () => { if (ws.current) ws.current.close(); };
    }, [roomId, isOwner]);

    return (
        <div className="game-container" style={{ position: 'relative' }}>
            <div className={`center-toast ${showError ? 'visible' : ''}`}>
                {errorMessage}
            </div>

            <GameOverOverlay result={gameResult} />

            <BackToHomeLink />
            
            <GameHeader timer={timer} difficulty={difficulty} />

            <div className="game-main-area">
                <PlayerCard title={players.you.name} avatar={players.you.avatar} lives={lives} />

                <div ref={boardRef} style={{ position: 'relative' }}>
                    <SudokuBoard 
                        board={board}
                        selectedCell={selectedCell}
                        onCellClick={handleCellClick}
                        isGameOver={isGameOver || gameResult !== null}
                        showError={showError} 
                        errorMessage={errorMessage}
                    />
                </div>

                <PlayerCard title={players.opponent.name} avatar={players.opponent.avatar} lives={opponentLives} align="right" />
            </div>

            <div className="controls-area">
                <ActionBtn onClick={() => handleInput(0)} disabled={isGameOver || gameResult !== null}>Erase</ActionBtn>
                <ActionBtn onClick={handleHint} disabled={isGameOver || gameResult !== null}>Hint</ActionBtn>
            </div>

            <Numpad onNumberClick={handleInput} disabled={isGameOver || gameResult !== null} />
            <HintModal isOpen={isHintModalOpen} data={hintData} onApply={applyHint} />
        </div>
    );
};

export default OnlineGame;