import React from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const NumpadGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 0.8vmin;
    margin-top: 1.2vmin;
    width: 45vmin;

    @media (max-width: 768px)
    {
        width: 80vmin;
        grid-template-columns: repeat(5, 1fr);
    }
`;

const NumKey = styled.button`
    padding: 1vmin;
    font-size: 2vmin;
    color: white;
    border: none;
    border-radius: 0.6vmin;
    transition: transform 0.1s, background-color 0.2s, opacity 0.2s;

    background-color: ${props => 
    {
        if (props.disabled)
            return '#7f8c8d';
            
        return '#34495e';
    }};

    cursor: ${props => 
    {
        if (props.disabled)
            return 'not-allowed';
            
        return 'pointer';
    }};

    opacity: ${props => 
    {
        if (props.disabled)
            return '0.5';
            
        return '1';
    }};

    &:active 
    {
        transform: ${props => 
        {
            if (props.disabled)
                return 'none';
                
            return 'scale(0.95)';
        }};
    }
`;

// COMPONENT DEFINITION
const Numpad = ({ onNumberClick, disabled }) => 
{
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <NumpadGrid>
            
            {numbers.map((num) => (
                <NumKey 
                    key={num} 
                    onClick={(e) => 
                    {
                        e.stopPropagation(); 
                        onNumberClick(num);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={disabled}
                >
                    {num}
                </NumKey>
            ))}
            
        </NumpadGrid>
    );
};

export default Numpad;