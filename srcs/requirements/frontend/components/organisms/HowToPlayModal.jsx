import React from 'react';
import '../../styles/Modal.css';

const HowToPlayModal = ({ isOpen, onClose }) => {
	if (!isOpen) return null;
	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" style={{position: 'relative'}} onClick={e => e.stopPropagation()}>
				<button className="modal-close" onClick={onClose} style={{
					position: 'absolute',
					top: 14,
					right: 14,
					width: 38,
					height: 38,
					borderRadius: '50%',
					border: 'none',
					background: 'linear-gradient(135deg, #29972d 60%, #37e831 100%)',
					color: '#fff',
					fontSize: '1.7rem',
					fontWeight: 900,
					boxShadow: '0 2px 8px rgba(51,132,55,0.13)',
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transition: 'background 0.2s, transform 0.1s',
					zIndex: 10
				}}
				onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #338437 60%, #37e831 100%)'}
				onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg, #29972d 60%, #37e831 100%)'}
				aria-label="Kapat"
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="10" cy="10" r="10" fill="none"/>
						<path d="M6.7 6.7L13.3 13.3M13.3 6.7L6.7 13.3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
					</svg>
				</button>
				<div style={{padding: '8px 0 0 0'}}>
					<h2 style={{textAlign: 'center', color: '#29972d', marginBottom: 24, fontWeight: 900, fontSize: '2.1rem', letterSpacing: '-1px'}}>How to Play?</h2>
					<div style={{marginBottom: 32}}>
						<h3 style={{color: '#338437', fontWeight: 800, fontSize: '1.3rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8}}>
							<span role="img" aria-label="single">🗡️</span> Singleplayer Mode
						</h3>
						<div style={{background: '#f4f8f4', borderRadius: 10, padding: '14px 18px', fontSize: '1.08rem', color: '#222', border: '1.5px solid #e0e0e0'}}>
							Sudoku is a 9x9 grid. This grid is divided by bold lines into 9 separate 3x3 boxes. The goal of the game is to fill the empty cells with numbers from 1 to 9.
							Each number from 1 to 9 must appear only once in <b>every row</b>, <b>every column</b>, and <b>every 3x3 box</b>.
						</div>
					</div>
					<div>
						<h3 style={{color: '#338437', fontWeight: 800, fontSize: '1.3rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8}}>
							<span role="img" aria-label="multi">⚔️</span> Multiplayer Mode
						</h3>
						<div style={{background: '#f4f8f4', borderRadius: 10, padding: '14px 18px', fontSize: '1.08rem', color: '#222', border: '1.5px solid #e0e0e0'}}>
							You and your opponent <b>race</b> to solve the same sudoku puzzle.<br />
							Each player starts with <b>3 lives</b> and loses 1 life for every mistake.<br />
							A player who loses all their lives is defeated and the other wins; or, after the puzzle is solved, the player with <b>more correct moves</b> wins.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HowToPlayModal;
