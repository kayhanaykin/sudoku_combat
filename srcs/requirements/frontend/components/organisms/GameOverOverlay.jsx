import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/GameOver.css';

const GameOverOverlay = ({ result, winnerName, loserName }) => 
{
    const navigate = useNavigate();

    if (!result)
        return null;

    const isWin = result === 'win';

    return (
        <div className={`game-over-overlay ${isWin ? 'overlay-win' : 'overlay-lose'}`}>
            
            {/* Background Effects */}
            {isWin ? (
                <div className="confetti-container">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={`confetti piece-${i % 5}`} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></div>
                    ))}
                </div>
            ) : (
                <div className="rain-container">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="drop" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></div>
                    ))}
                </div>
            )}

            {/* Content Box */}
            <div className="game-over-box">
                <h1 className={isWin ? 'text-win' : 'text-lose'}>
                    {isWin ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
                </h1>
                
                <div className="players-result">
                    <p className="winner-text">Winner: <span>{winnerName}</span></p>
                    <p className="loser-text">Loser: <span>{loserName}</span></p>
                </div>

                <button className="back-home-btn" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default GameOverOverlay;