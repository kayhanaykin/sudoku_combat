import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import useGameLogic from '../hooks/useGameLogic';
import GameHeader from '../components/molecules/GameHeader';
import PlayerCard from '../components/molecules/PlayerCard';
import SudokuBoard from '../components/organisms/SudokuBoard';
import Numpad from '../components/molecules/Numpad';
import HintModal from '../components/molecules/HintModal';
import ActionBtn from '../components/atoms/ActionBtn';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import GameOverOverlay from '../components/organisms/GameOverOverlay';
import { getUserById } from '../services/userService';

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
`;

const ControlsArea = styled.div`
    margin-top: 1.5vmin;
    display: flex;
    gap: 1.5vmin;
    justify-content: center;
`;

const ModeCardWrapper = styled.div`
    background-color: #f3f7ff;
    padding: 2vmin;
    border-radius: 1.5vmin;
    text-align: center;
    width: 18vmin;
    min-height: 21vmin;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1vmin;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    opacity: 0.8;

    @media (max-width: 768px)
    {
        width: 25vmin; 
        min-height: auto; 
        flex-direction: row; 
        justify-content: space-between; 
        padding: 1vmin 2vmin;
    }
`;

const ModeCardTitle = styled.div`
    font-weight: bold;
    font-size: 2.3vmin;
    color: #020d18;
`;

const ModeText = styled.div`
    font-size: 1.8vmin;
    font-weight: bold;
    color: #9a9b9b;
`;

// COMPONENT DEFINITION
const OfflineGame = () => 
{
    const location = useLocation();
    const { user } = useAuth();
    
    const boardRef = useRef(null);
    const controlsRef = useRef(null); 
    
    const [playerName, setPlayerName] = useState('You');

    let logicUsername = playerName;
    if (user)
    {
        if (user.username)
            logicUsername = user.username;
    }

    const { 
        board, timer, difficulty, lives, selectedCell, isGameOver,
        handleCellClick, handleInput, showError, errorMessage,
        isHintModalOpen, hintData, handleHint, applyHint,
        gameResult,
        setSelectedCell
    } = useGameLogic('offline', null, { username: logicUsername });

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
        
        return () => 
        {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setSelectedCell, isGameOver]);

    useEffect(() => 
    {
        if (location.state)
        {
            if (location.state.userId)
            {
                getUserById(location.state.userId).then(data => 
                {
                    let finalName = "Player";
                    
                    if (data.display_name)
                        finalName = data.display_name;
                    else if (data.nickname)
                        finalName = data.nickname;
                    else if (data.username)
                        finalName = data.username;
                        
                    setPlayerName(finalName);
                }).catch(() => {});
            }
            else if (location.state.username)
                setPlayerName(location.state.username);
        }
    }, [location.state]);

    // LOGIC-DRIVEN RENDERING
    let winnerName = "Computer";
    if (gameResult === 'win')
        winnerName = playerName;

    let loserName = "Computer";
    if (gameResult === 'lose')
        loserName = playerName;

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
            
            <GameOverOverlay 
                result={gameResult} 
                winnerName={winnerName} 
                loserName={loserName} 
            />

            <BackToHomeLink />
            
            <GameHeader 
                timer={timer} 
                difficulty={difficulty} 
            />

            <GameMainArea>

                <PlayerCard 
                    title={playerName} 
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

                <ModeCardWrapper>
                    <ModeCardTitle>Mode</ModeCardTitle>
                    <ModeText>Offline</ModeText>
                </ModeCardWrapper>
                
            </GameMainArea>

            <ControlsWrapper ref={controlsRef}>
                <ControlsArea>
                    <ActionBtn onClick={handleHint} disabled={isGameDisabled}>
                        Hint
                    </ActionBtn>
                </ControlsArea>

                <Numpad onNumberClick={handleInput} disabled={isGameDisabled} />
            </ControlsWrapper>

            <HintModal 
                isOpen={isHintModalOpen} 
                data={hintData} 
                onApply={applyHint} 
            />

        </GameContainer>
    );
};

export default OfflineGame;