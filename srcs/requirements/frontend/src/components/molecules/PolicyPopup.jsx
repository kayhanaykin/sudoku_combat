import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// --- STYLED COMPONENTS ---

const PopupContainer = styled.div`
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 30px;
    padding: 12px 24px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 9999; 
    display: flex;
    align-items: center;
    gap: 20px;
    width: max-content;
    max-width: 90vw;
    animation: slideUp 0.5s ease-out;

    @keyframes slideUp
    {
        from
        {
            transform: translate(-50%, 100px);
            opacity: 0;
        }

        to
        {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }

    @media (max-width: 768px)
    {
        bottom: 15px;
        flex-direction: column;
        text-align: center;
        gap: 15px;
        border-radius: 20px;
    }
`;

const TextContent = styled.div`
    font-size: 1.15rem;
    color: #4b5563;
    font-family: 'Inter', sans-serif;
`;

const PolicyLink = styled(Link)`
    color: #15803d;
    text-decoration: none;
    font-weight: 800;
    transition: color 0.2s;

    &:hover
    {
        color: #166534;
        text-decoration: underline;
    }
`;

// --- COMPONENT DEFINITION ---

const PolicyPopup = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible)
        return null;

    return (
        <PopupContainer>
            <TextContent>
                By playing Sudoku Combat, you agree to our{' '}
                <PolicyLink to="/terms-of-service">Terms</PolicyLink> and{' '}
                <PolicyLink to="/privacy-policy">Privacy Policy</PolicyLink>.
            </TextContent>
        </PopupContainer>
    );
};

export default PolicyPopup;