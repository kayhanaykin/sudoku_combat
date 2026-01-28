import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { makeMove } from '../services/api';
import '../styles/Game.css';

const formatBoardFromData = (rawBoard) => {
  if (!rawBoard) return [];
  return rawBoard.map(row => 
    row.map(num => ({
      value: num,
      isFixed: num !== 0,
      isError: false
    }))
  );
};

const EMPTY_BOARD = Array(9).fill(null).map(() => Array(9).fill({ value: 0, isFixed: false, isError: false }));

const OfflineGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [gameId, setGameId] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [timer, setTimer] = useState("00:00");
  const [difficulty, setDifficulty] = useState("Medium");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lives, setLives] = useState(3); 
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [hintData, setHintData] = useState(null);

  useEffect(() => {
    if (location.state) {
        const { gameData, difficulty: diffLevel } = location.state;
        if (gameData) {
            const rawBoard = gameData.board || gameData.grid;
            const id = gameData.gameId;
            if (rawBoard) setBoard(formatBoardFromData(rawBoard));
            if (id) setGameId(id);
        }
        if (diffLevel) {
            const levels = {1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert', 5: 'Extreme'};
            setDifficulty(levels[diffLevel] || diffLevel || 'Medium');
        }
    }
  }, [location]);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => { setTimer(prev => prev); }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleCellClick = (r, c) => {
    if (isGameOver) return;
    setSelectedCell({ r, c });
  };

  const handleInput = async (number) => {
    if (!selectedCell || isGameOver) return;
    const { r, c } = selectedCell;
    if (board[r][c].isFixed) return;

    const newBoard = [...board];
    newBoard[r] = [...newBoard[r]];
    newBoard[r][c] = { ...newBoard[r][c], value: number, isError: false };
    setBoard(newBoard);
    setShowError(false);

    try {
      const result = await makeMove(gameId || '1', r, c, number);
      if (result.correct === false && number !== 0) {
        const newLives = lives - 1;
        setLives(newLives);
        
        if (newLives === 0) {
            setErrorMessage("GAME OVER 💀");
            setIsGameOver(true);
            setShowError(true);
        } else {
            setErrorMessage("Wrong Move! 💔");
            setShowError(true);
            setTimeout(() => setShowError(false), 1500);
        }

        setBoard(prev => {
          const updated = [...prev];
          updated[r] = [...updated[r]];
          updated[r][c] = { ...updated[r][c], isError: true };
          return updated;
        });
      }
    } catch (error) { console.error("Validation error:", error); }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (!selectedCell || isGameOver) return;
        if (e.key >= '1' && e.key <= '9')
          handleInput(parseInt(e.key));
        else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0')
          handleInput(0);
        else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            moveSelection(e.key);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, board, gameId, lives, isGameOver]);

  const moveSelection = (key) => {
    let { r, c } = selectedCell;
    if (key === 'ArrowUp') r = Math.max(0, r - 1);
    if (key === 'ArrowDown') r = Math.min(8, r + 1);
    if (key === 'ArrowLeft') c = Math.max(0, c - 1);
    if (key === 'ArrowRight') c = Math.min(8, c + 1);
    setSelectedCell({ r, c });
  };

  const renderHearts = () => {
    const hearts = [];
    for (let i = 1; i <= 3; i++) {
        if (i <= lives)
            hearts.push(<span key={i} className="heart-icon">❤️</span>);
        else
            hearts.push(<span key={i} className="heart-icon broken">💔</span>);
    }
    return <div className="hearts-container">{hearts}</div>;
  };

  const isHighlighted = (r, c) => {
    if (!selectedCell) return false;

    const { r: selR, c: selC } = selectedCell;
    
    if (selR === r && selC === c) return false;

    if (board[selR][selC].value === 0) return false;

    const sameRow = (r === selR);
    const sameCol = (c === selC);
    const sameBox = Math.floor(r / 3) === Math.floor(selR / 3) && 
                    Math.floor(c / 3) === Math.floor(selC / 3);

    return sameRow || sameCol || sameBox;
  };

  const handleHint = async () => {
    if (isGameOver) return;

    try {
      const simpleGrid = board.map(row => row.map(cell => cell.value));

      const response = await fetch('/api/game/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid: simpleGrid })
      });

      const text = await response.text();
      
      if (!response.ok) {
        setErrorMessage("Server Error: " + response.status);
        setShowError(true);
        return;
      }

      const data = JSON.parse(text);

      if (data.found) {
        setHintData(data);
        setIsHintModalOpen(true);
        setSelectedCell({ r: data.row, c: data.col });
      } else {
        setErrorMessage("⚠️ " + data.message);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }

    } catch (error) {
      console.error("Hint error:", error);
      setErrorMessage("Data processing error!");
      setShowError(true);
    }
  };

  const applyHint = async () => {
    if (!hintData) return;

    const { row, col, value } = hintData;

    setBoard(prev => {
      const newBoard = [...prev];
      newBoard[row] = [...newBoard[row]]; 
      newBoard[row][col] = { 
        ...newBoard[row][col], 
        value: value,
        isFixed: false
      };
      return newBoard;
    });

    setIsHintModalOpen(false);
    setHintData(null);

    if (gameId) {
        try {
            await makeMove(gameId, row, col, value);
        } catch (err) {
            console.error("Hint move save error", err);
        }
    }
  };

  return (
    <div className="game-container">
      
      <button className="fixed-home-btn" onClick={() => navigate('/')}>
          <span className="btn-icon">🏠</span>
          <span className="btn-text">Go to Home</span>
      </button>

      <div className="game-header">
        <div className="info-badge timer">{timer}</div>
        <div className="info-badge difficulty">{difficulty}</div>
      </div>

      <div className="game-main-area">
        
        <div className="player-card">
           <div className="card-title">Player 1</div>
           <small>Score: 0</small>
           {renderHearts()}
        </div>

        <div className="sudoku-board">
          
          {board.map((row, rIndex) => (
            <React.Fragment key={rIndex}>
              {row.map((cell, cIndex) => {
                const highlightClass = isHighlighted(rIndex, cIndex) ? 'highlighted-area' : '';
                
                return (
                  <div
                    key={`${rIndex}-${cIndex}`}
                    className={`sudoku-cell 
                      ${selectedCell?.r === rIndex && selectedCell?.c === cIndex ? 'selected' : ''}
                      ${highlightClass} 
                      ${cell.isFixed ? 'fixed' : ''}
                      ${cell.isError ? 'error' : ''}
                    `}
                    onClick={() => handleCellClick(rIndex, cIndex)}
                  >
                    {cell.value !== 0 ? cell.value : ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}

          <div 
            className={`center-toast ${showError ? 'visible' : ''}`} 
            style={isGameOver ? {backgroundColor: 'rgba(44, 62, 80, 0.95)', opacity: 1, visibility: 'visible'} : {}}
          >
            {errorMessage}
            {isGameOver && <div style={{fontSize: '0.5em', marginTop: '10px', fontWeight:'normal'}}>Press Home to Exit</div>}
          </div>

        </div>

        <div className="player-card right-card">
           <div className="card-title">Mode</div>
           <div className="mode-text">Offline</div>
        </div>
      </div>

      <div className="controls-area">
        <button className="action-btn" onClick={() => handleInput(0)} disabled={isGameOver}>Erase</button>
        <button className="action-btn" onClick={handleHint} disabled={isGameOver}>Hint</button>
      </div>

      <div className="numpad-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num} 
            className="num-key" 
            onClick={() => handleInput(num)}
            disabled={isGameOver}
          >
            {num}
          </button>
        ))}
      </div>

      {isHintModalOpen && hintData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">💡 Hint Found!</div>
            <p className="modal-message">
              {hintData.message}
            </p>
            <div style={{fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#2980b9'}}>
              {hintData.value}
            </div>
            <button className="modal-btn" onClick={applyHint}>
              Apply Hint
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default OfflineGame;