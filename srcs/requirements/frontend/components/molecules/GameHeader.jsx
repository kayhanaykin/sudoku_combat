import React from 'react';
import styled from 'styled-components';
import { device } from '../../src/utils/device';
import InfoBadge from '../atoms/InfoBadge';

// STYLED COMPONENTS
const HeaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
`;

const HeaderContainer = styled.div`
    display: flex;
    gap: 1.5vmin;
    margin-bottom: 1.5vmin;
    width: 45vmin;
    justify-content: space-between;

    @media ${device.tablet}
    {
        width: 80vmin;
    }
`;

// COMPONENT DEFINITION
const GameHeader = ({ timer, difficulty, onHomeClick }) => 
{
    return (
        <HeaderWrapper>
            <HeaderContainer>
                
                <InfoBadge text={timer} type="timer" />
                <InfoBadge text={difficulty} type="difficulty" />
                
            </HeaderContainer>
        </HeaderWrapper>
    );
};

export default GameHeader;