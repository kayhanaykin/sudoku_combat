import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/GameOver.css';

const GameOverOverlay = ({ result }) => 
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
                    {isWin ? '🏆 VICTORY 🏆' : '💀 DEFEAT 💀'}
                </h1>
                
                <div className="players-result" style={{ marginTop: '10px', marginBottom: '20px' }}>
                    <h2 className={isWin ? 'winner-text' : 'loser-text'} style={{ fontSize: '2rem', margin: 0 }}>
                        {isWin ? 'You Win!' : 'You Lose!'}
                    </h2>
                </div>

                <button className="back-home-btn" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default GameOverOverlay;