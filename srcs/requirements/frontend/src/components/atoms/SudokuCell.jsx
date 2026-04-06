import React from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const CellContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 0.1vmin solid #8c8d8f;
    border-bottom: 0.1vmin solid #8c8d8f;
    font-size: 2.8vmin;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.1s;
    border-right: ${props => props.$isThickRight ? '3px solid #091420' : '1px solid #ccc'};
    border-bottom: ${props => props.$isThickBottom ? '3px solid #091420' : '1px solid #ccc'};
    
    &:nth-child(3n) 
    {
        border-right: 0.3vmin solid #2c3e50;
    }
    
    &:nth-child(9n) 
    {
        border-right: none;
    }
    
    &:nth-child(n+19):nth-child(-n+27),
    &:nth-child(n+46):nth-child(-n+54) 
    {
        border-bottom: 0.3vmin solid #2c3e50;
    }
    
    &:nth-child(n+73) 
    {
        border-bottom: none;
    }

    background-color: ${props => 
    {
        if (props.$isSelected)
            return '#2ecc71';
        else if (props.$isSameNumber)
            return '#a3e4d7';
        else if (props.$isHighlighted)
            return '#d1f2eb';
        else if (props.$isError)
            return '#ffcdd2';
        else if (props.$isFixed)
            return '#ffffff';
            
        return 'transparent';
    }};

    color: ${props => 
    {
        if (props.$isSelected)
            return '#ffffff';
        else if (props.$isSameNumber)
            return '#0f4f42';
        else if (props.$isError)
            return '#c62828';
            
        return '#2c3e50';
    }};

    &:hover 
    {
        background-color: ${props => 
        {
            if (props.$isSelected)
                return '#2ecc71';
            else if (props.$isFixed)
                return '#ffffff';
            else if (props.$isError)
                return '#ffcdd2';
                
            return '#e3f2fd';
        }};
    }
    
    @media (max-width: 768px)
    {
        font-size: 3.5vmin;
    }
`;

// COMPONENT DEFINITION
const SudokuCell = ({ value, isFixed, isError, isSelected, isHighlighted, isSameNumber, onClick }) => 
{
    return (
        <CellContainer
            onClick={onClick}
            $isFixed={isFixed}
            $isError={isError}
            $isSelected={isSelected}
            $isHighlighted={isHighlighted}
            $isSameNumber={isSameNumber}
        >
            {value !== 0 ? value : ''}
        </CellContainer>
    );
};

export default SudokuCell;