import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { makeMove } from '../../services/api';

const EMPTY_BOARD = Array(9).fill(null).map(() => Array(9).fill({ value: 0, isFixed: false, isError: false }));

const formatBoardFromData = (rawBoard) =>
{
  if (!rawBoard)
    return [];
  return rawBoard.map(row => 
    row.map(num => ({
      value: num,
      isFixed: num !== 0,
      isError: false
    }))
  );
};

const formatTime = (totalSeconds) =>
{
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const useGameLogic = (mode = 'offline') =>
{
  const location = useLocation();
  const navigate = useNavigate();

  const [board, setBoard] = useState(EMPTY_BOARD);
  const [gameId, setGameId] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  
  const [seconds, setSeconds] = useState(0);
  const [difficulty, setDifficulty] = useState("Medium");
  
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [hintData, setHintData] = useState(null);

  useEffect(() =>
  {
    if (location.state)
    {
      const { gameData, difficulty: diffLevel } = location.state;
      
      if (gameData)
      {
        const rawBoard = gameData.board || gameData.current_board;
        const id = gameData.game_id || gameData.gameId;
        
        if (rawBoard)
          setBoard(formatBoardFromData(rawBoard));
        if (id)
          setGameId(id);
        if (gameData.lives !== undefined)
          setLives(gameData.lives);
      }
      
      if (diffLevel)
      {
        const levels = {1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert', 5: 'Extreme'};
        setDifficulty(levels[diffLevel] || diffLevel || 'Medium');
      }
    }
  }, [location]);

  useEffect(() =>
  {
    if (isGameOver)
      return;
    
    const interval = setInterval(() =>
    { 
      setSeconds(prev => prev + 1); 
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleCellClick = (r, c) =>
  {
    if (isGameOver)
      return;
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
        setBoard(prev => {
            const newBoard = [...prev];
            newBoard[r] = [...newBoard[r]];
            newBoard[r][c] = { ...newBoard[r][c], value: 0, isError: false };
            return newBoard;
        });
        return;
    }

    try
    {
      const response = await makeMove(gameId, r, c, number);
      
      if (response.result === 'CORRECT')
      {
        setBoard(prev => {
            const newBoard = [...prev];
            newBoard[r] = [...newBoard[r]];
            newBoard[r][c] = { ...newBoard[r][c], value: number, isError: false };
            return newBoard;
        });
        setShowError(false);
      }
      else if (response.result === 'WIN')
      {
        setBoard(prev => {
            const newBoard = [...prev];
            newBoard[r] = [...newBoard[r]];
            newBoard[r][c] = { ...newBoard[r][c], value: number, isError: false };
            return newBoard;
        });
        setErrorMessage("YOU WON! 🎉");
        setIsGameOver(true);
        setShowError(true);
      }
      else if (response.result === 'WRONG')
      {
        setLives(response.lives);
        setErrorMessage("Wrong Move!");
        setShowError(true);
        setTimeout(() => setShowError(false), 1500);
      }
      else if (response.result === 'GAME_OVER' || response.status === 'LOST')
      {
        setLives(0);
        setErrorMessage("GAME OVER 💀");
        setIsGameOver(true);
        setShowError(true);
      }
    }
    catch (error)
    {
      console.error("Validation error:", error);
    }
  };

  useEffect(() =>
  {
    const handleKeyDown = (e) =>
    {
      if (!selectedCell || isGameOver)
        return;
      
      if (e.key >= '1' && e.key <= '9')
        handleInput(parseInt(e.key));
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0')
        handleInput(0);
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key))
      {
        e.preventDefault();
        moveSelection(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, board, gameId, lives, isGameOver]);

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

  const handleHint = async () =>
  {
    if (isGameOver)
      return;

    try
    {
      const simpleGrid = board.map(row => row.map(cell => cell.value));

      const response = await fetch('/api/game/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid: simpleGrid })
      });

      if (!response.ok)
      {
        setErrorMessage("Server Error: " + response.status);
        setShowError(true);
        return;
      }

      const data = await response.json();

      if (data.found)
      {
        setHintData(data);
        setIsHintModalOpen(true);
        setSelectedCell({ r: data.row, c: data.col });
      }
      else
      {
        setErrorMessage("⚠️ " + (data.message || "No hint found"));
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    }
    catch (error)
    {
      console.error("Hint error:", error);
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
      newBoard[row][col] = { 
        ...newBoard[row][col], 
        value: value,
        isFixed: false,
        isError: false
      };
      return newBoard;
    });

    setIsHintModalOpen(false);
    setHintData(null);

    if (gameId)
    {
      try
      {
        await makeMove(gameId, row, col, value);
      }
      catch (err)
      {
        console.error("Hint move save error", err);
      }
    }
  };

  return {
    board,
    timer: formatTime(seconds),
    difficulty,
    lives,
    selectedCell,
    isGameOver,
    showError,
    errorMessage,
    isHintModalOpen,
    hintData,
    handleCellClick,
    handleInput,
    handleHint,
    applyHint,
    setIsHintModalOpen,
    setHintData,
    setBoard
  };
};

export default useGameLogic;