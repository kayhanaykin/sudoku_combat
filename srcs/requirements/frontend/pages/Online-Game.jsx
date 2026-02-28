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
import '../styles/Game.css';

const OnlineGame = () => 
{
    const { roomId } = useParams();
    const location = useLocation();
    const ws = useRef(null);

    const isOwner = location.state?.role === 'owner';

    const sendOnlineMove = (row, col, value) => 
    {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) 
        {
            ws.current.send(JSON.stringify(
            {
                event: 'move',
                data: 
                {
                    roomId: roomId.toString(),
                    role: isOwner ? 'owner' : 'guest',
                    row: row,
                    col: col,
                    value: value
                }
            }));
        }
    };

    const { 
        board, timer, difficulty, lives, selectedCell, isGameOver,
        handleCellClick, handleInput, showError, errorMessage,
        isHintModalOpen, hintData, handleHint, applyHint,
        setLives, updateBoardFromOpponent,
        setShowError, setErrorMessage,
        gameResult, setGameResult
    } = useGameLogic('online', sendOnlineMove); 

    const [opponentLives, setOpponentLives] = useState(3);

    useEffect(() => 
    {
        if (!roomId) 
        {
            return;
        }

        ws.current = new WebSocket('wss://localhost:8443/api/play');

        ws.current.onopen = () => 
        {
            ws.current.send(JSON.stringify(
            {
                event: 'join_room',
                data: { roomId: roomId.toString() }
            }));
        };

        ws.current.onmessage = (event) => 
        {
            const message = JSON.parse(event.data);

            switch (message.event) 
            {
                case 'sync_game':
                    if (message.gameState && message.gameState.currBoard) 
                    {
                        updateBoardFromOpponent(message.gameState.currBoard);
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
                        setErrorMessage("Wrong Move!");
                        setShowError(true);
                        setTimeout(() => setShowError(false), 1500);
                    }

                    if (message.winner || message.loser) 
                    {
                        const myRole = isOwner ? 'owner' : 'guest';
                        
                        setTimeout(() => 
                        {
                            if (message.winner === myRole) 
                            {
                                setGameResult('win');
                            } 
                            else 
                            {
                                setGameResult('lose');
                            }
                        }, message.valid === false ? 1000 : 0);
                    }
                    break;
                
                case 'player_left':
                    setGameResult('win');
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
            {
                ws.current.close();
            }
        };
    }, [roomId, isOwner]);

    return (
        <div className="game-container" style={{ position: 'relative' }}>
            
            <GameOverOverlay 
                result={gameResult} 
                winnerName={gameResult === 'win' ? "You" : "Opponent"} 
                loserName={gameResult === 'lose' ? "You" : "Opponent"} 
            />

            <BackToHomeLink />
            
            <GameHeader 
                timer={timer} 
                difficulty={difficulty} 
            />

            <div className="game-main-area">
                <PlayerCard title="You" lives={lives} />

                <SudokuBoard 
                    board={board}
                    selectedCell={selectedCell}
                    onCellClick={handleCellClick}
                    showError={showError}
                    errorMessage={errorMessage}
                    isGameOver={isGameOver || gameResult !== null}
                />

                <PlayerCard title="Opponent" lives={opponentLives} align="right" />
            </div>

            <div className="controls-area">
                <ActionBtn onClick={() => handleInput(0)} disabled={isGameOver || gameResult !== null}>
                    Erase
                </ActionBtn>
                
                <ActionBtn onClick={handleHint} disabled={isGameOver || gameResult !== null}>
                    Hint
                </ActionBtn>
            </div>

            <Numpad onNumberClick={handleInput} disabled={isGameOver || gameResult !== null} />

            <HintModal 
                isOpen={isHintModalOpen} 
                data={hintData} 
                onApply={applyHint} 
            />

        </div>
    );
};

export default OnlineGame;