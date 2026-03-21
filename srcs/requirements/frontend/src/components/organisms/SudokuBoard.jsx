import React from 'react';
import styled from 'styled-components';
import SudokuCell from '../atoms/SudokuCell';
import { checkIsHighlighted } from '../../utils/sudokuUtils';

// STYLED COMPONENTS
const BoardContainer = styled.div`
    display: grid;
    width: 45vmin;
    height: 45vmin;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(9, 1fr);
    border: 0.3vmin solid #2c3e50;
    border-radius: 1vmin;
    background-color: #fff;
    position: relative;
    overflow: hidden; 
    box-shadow: 0 1vmin 2vmin rgba(0,0,0,0.15);
    box-sizing: content-box;

    @media (max-width: 768px)
    {
        width: 80vmin;
        height: 80vmin;
    }
`;

const LoadingText = styled.div`
    font-size: 2vmin;
    color: #2c3e50;
    font-weight: bold;
`;

// COMPONENT DEFINITION
const SudokuBoard = ({ board, selectedCell, onCellClick }) => 
{
    if (!board || board.length === 0) 
        return <LoadingText>Loading Board...</LoadingText>;

    let selectedValue = 0;
    if (selectedCell)
    {
        if (board[selectedCell.r])
        {
            if (board[selectedCell.r][selectedCell.c])
                selectedValue = board[selectedCell.r][selectedCell.c].value;
        }
    }

    return (
        <BoardContainer>
            {board.map((row, rIndex) => (
                <React.Fragment key={rIndex}>
                    {row.map((cell, cIndex) => 
                    {
                        const isHighlighted = checkIsHighlighted(rIndex, cIndex, selectedCell);
                        let isSameNumber = false;
                        
                        if (selectedCell)
                        {
                            if (selectedValue !== 0)
                            {
                                if (cell.value === selectedValue)
                                {
                                    if (selectedCell.r !== rIndex || selectedCell.c !== cIndex)
                                        isSameNumber = true;
                                }
                            }
                        }

                        let isSelected = false;
                        if (selectedCell)
                        {
                            if (selectedCell.r === rIndex)
                            {
                                if (selectedCell.c === cIndex)
                                    isSelected = true;
                            }
                        }

                        return (
                            <SudokuCell
                                key={`${rIndex}-${cIndex}`}
                                value={cell.value}
                                isFixed={cell.isFixed}
                                isError={cell.isError}
                                isSelected={isSelected}
                                isHighlighted={isHighlighted}
                                isSameNumber={isSameNumber}
                                onClick={() => onCellClick(rIndex, cIndex)}
                            />
                        );
                    })}
                </React.Fragment>
            ))}
        </BoardContainer>
    );
};

export default SudokuBoard;