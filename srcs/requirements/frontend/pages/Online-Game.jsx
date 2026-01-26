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

const OnlineGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- STATE ---
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [gameId, setGameId] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [timer, setTimer] = useState("00:00");
  const [difficulty, setDifficulty] = useState("Medium"); // Varsayılan

  // Hata Mesajı ve Canlar
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lives, setLives] = useState(3); // Player 1 Canı
  const [opponentLives, setOpponentLives] = useState(3); // Player 2 Canı (Şimdilik sabit)
  const [isGameOver, setIsGameOver] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (location.state) {
        const { gameData, difficulty: diffLevel } = location.state;
        
        if (gameData) {
            const rawBoard = gameData.board || gameData.grid;
            const id = gameData.gameId;
            if (rawBoard) setBoard(formatBoardFromData(rawBoard));
            if (id) setGameId(id);
        }
        
        // Zorluk derecesini al (Home'dan geldiyse)
        if (diffLevel) {
            const levels = {1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert', 5: 'Extreme'};
            setDifficulty(levels[diffLevel] || 'Medium');
        }
    }
  }, [location]);

  // --- TIMER ---
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
        setTimer(prev => prev); // (Zamanlayıcı mantığını buraya ekleyebilirsin)
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleCellClick = (r, c) => {
    if (isGameOver) return;
    setSelectedCell({ r, c });
  };

  // --- MOVE LOGIC ---
  const handleInput = async (number) => {
    if (!selectedCell || isGameOver) return;
    const { r, c } = selectedCell;

    if (board[r][c].isFixed) return;

    // Optimistic Update
    const newBoard = [...board];
    newBoard[r] = [...newBoard[r]];
    newBoard[r][c] = { 
      ...newBoard[r][c], 
      value: number, 
      isError: false 
    };
    setBoard(newBoard);
    setShowError(false);

    try {
      const result = await makeMove(gameId || '1', r, c, number);
      
      // HATA KONTROLÜ
      if (result.correct === false && number !== 0) {
        
        // Can Azalt
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

        // Hücreyi Kızart
        setBoard(prev => {
          const updated = [...prev];
          updated[r] = [...updated[r]];
          updated[r][c] = { ...updated[r][c], isError: true };
          return updated;
        });
      }
    } catch (error) {
      console.error("Move error:", error);
    }
  };

  // --- KEYBOARD ---
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (!selectedCell || isGameOver) return;
        if (e.key >= '1' && e.key <= '9') handleInput(parseInt(e.key));
        else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') handleInput(0);
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

  // --- HEART RENDERER HELPER ---
  // currentLives: Kaç can kaldığı
  const renderHearts = (currentLives) => {
    const hearts = [];
    for (let i = 1; i <= 3; i++) {
        if (i <= currentLives) {
            hearts.push(<span key={i} className="heart-icon">❤️</span>);
        } else {
            hearts.push(<span key={i} className="heart-icon broken">💔</span>);
        }
    }
    return <div className="hearts-container">{hearts}</div>;
  };

  return (
    <div className="game-container">
      
      <div className="game-header">
        <button className="home-btn" onClick={() => navigate('/')}>
          <span className="btn-icon">🏠</span>
          <span className="btn-text">Home</span>
        </button>
        
        {/* SÜRE VE ZORLUK YAN YANA */}
        <div style={{display: 'flex', gap: '10px'}}>
            <div className="timer-box">{timer}</div>
            <div className="timer-box" style={{backgroundColor: '#ffeaa7'}}>
                {difficulty}
            </div>
        </div>
        
        <div className="header-spacer"></div>
      </div>

      <div className="game-main-area">
        
        {/* PLAYER 1 (SOL) */}
        <div className="player-card">
          <div>Player 1 (You)</div>
          <small>Score: 0</small>
          {/* Player 1 Canları */}
          {renderHearts(lives)}
        </div>

        <div className="sudoku-board">
          
          {/* HÜCRELER */}
          {board.map((row, rIndex) => (
            <React.Fragment key={rIndex}>
              {row.map((cell, cIndex) => (
                <div
                  key={`${rIndex}-${cIndex}`}
                  className={`sudoku-cell 
                    ${selectedCell?.r === rIndex && selectedCell?.c === cIndex ? 'selected' : ''}
                    ${cell.isFixed ? 'fixed' : ''}
                    ${cell.isError ? 'error' : ''}
                  `}
                  onClick={() => handleCellClick(rIndex, cIndex)}
                >
                  {cell.value !== 0 ? cell.value : ''}
                </div>
              ))}
            </React.Fragment>
          ))}
          
          {/* HATA MESAJI (EN SONDA - CSS HATASINI ÖNLEMEK İÇİN) */}
          <div 
            className={`error-toast ${showError ? 'visible' : ''}`} 
            style={isGameOver ? {backgroundColor: '#2c3e50', opacity: 1, visibility: 'visible'} : {}}
          >
            {errorMessage}
          </div>

        </div>

        {/* PLAYER 2 (SAĞ) */}
        <div className="player-card">
          <div>Player 2</div>
          <small>Score: 0</small>
          {/* Player 2 Canları (Şimdilik Sabit) */}
          {renderHearts(opponentLives)}
        </div>
      </div>

      <div className="controls-area">
        <button className="action-btn" onClick={() => handleInput(0)} disabled={isGameOver}>Erase</button>
        <button className="action-btn" disabled={isGameOver}>Hint</button>
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
    </div>
  );
};

export default OnlineGame;