import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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

const OfflineGame = () => 
{
    const location = useLocation();
    const boardRef = useRef(null);
    const [playerName, setPlayerName] = useState('You');

    const { 
        board, timer, difficulty, lives, selectedCell, isGameOver,
        handleCellClick, handleInput, showError, errorMessage,
        isHintModalOpen, hintData, handleHint, applyHint,
        gameResult,
        setSelectedCell
    } = useGameLogic('offline', null, { username: playerName });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (boardRef.current && !boardRef.current.contains(event.target))
            {
                const isControlClick = event.target.closest('.controls-area') || event.target.closest('.numpad-grid');
                if (!isControlClick && setSelectedCell)
                    setSelectedCell(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setSelectedCell]);

    useEffect(() => 
    {
        if (location.state?.userId) 
        {
            getUserById(location.state.userId).then(data => 
            {
                setPlayerName(data.display_name || data.nickname || data.username || "Player");
            }).catch(() => {});
        } 
        else if (location.state?.username) 
        {
            setPlayerName(location.state.username);
        }
    }, [location.state]);

    return (
        <div className="game-container" style={{ position: 'relative' }}>
            <div className={`center-toast ${showError ? 'visible' : ''}`}>
                {errorMessage}
            </div>
            <GameOverOverlay 
                result={gameResult} 
                winnerName={gameResult === 'win' ? playerName : "Computer"} 
                loserName={gameResult === 'lose' ? playerName : "Computer"} 
            />

            <BackToHomeLink />
            
            <GameHeader 
                timer={timer} 
                difficulty={difficulty} 
            />

            <div className="game-main-area">
                <PlayerCard title={playerName} lives={lives} />

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

                <div className="player-card right-card">
                    <div className="card-title">Mode</div>
                    <div className="mode-text">Offline</div>
                </div>
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

            <HintModal isOpen={isHintModalOpen} data={hintData} onApply={applyHint} />

        </div>
    );
};

export default OfflineGame;