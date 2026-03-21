import React from 'react';
import styled from 'styled-components';
import ProfileImage from '../atoms/ProfileImage';

const BASE_URL = '';

// STYLED COMPONENTS
const CardWrapper = styled.div`
    background-color: #f3f7ff;
    padding: 2vmin;
    border-radius: 1.5vmin;
    text-align: center;
    width: 18vmin;
    min-height: 21vmin;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1vmin;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);

    opacity: ${props => 
    {
        if (props.$align === 'right')
            return '0.8';
            
        return '1';
    }};

    @media (max-width: 768px)
    {
        width: 25vmin;
        min-height: auto; 
        flex-direction: row; 
        justify-content: space-between; 
        padding: 1vmin 2vmin;
    }
`;

const StyledProfileImage = styled(ProfileImage)`
    width: 9vmin !important; 
    height: 9vmin !important;
    border-width: 0.5vmin !important;
    margin-bottom: 0.3vmin;
`;

const CardTitle = styled.div`
    background-color: transparent;
    font-weight: bold;
    font-size: 2.3vmin;
    color: #020d18;
`;

const HeartsContainer = styled.div`
    display: flex;
    gap: 0.4vmin;
    font-size: 2vmin;
`;

const HeartIcon = styled.span`
    opacity: ${props => 
    {
        if (props.$isBroken)
            return '0.4';
            
        return '1';
    }};

    filter: ${props => 
    {
        if (props.$isBroken)
            return 'grayscale(1)';
            
        return 'none';
    }};
`;

// COMPONENT DEFINITION
const PlayerCard = ({ title, lives, align, avatar }) => 
{
    let finalAvatarUrl = null;
    
    if (avatar) 
    {
        if (avatar.startsWith('http'))
            finalAvatarUrl = avatar;
        else
            finalAvatarUrl = `${BASE_URL}${avatar}`;
    }

    const renderHearts = () => 
    {
        const hearts = [];
        
        for (let i = 0; i < 3; i++) 
        {
            let isBroken = false;
            if (i >= lives)
                isBroken = true;

            let heartSymbol = '❤️';
            if (isBroken)
                heartSymbol = '🖤';

            hearts.push(
                <HeartIcon key={i} $isBroken={isBroken}>
                    {heartSymbol}
                </HeartIcon>
            );
        }
        
        return hearts;
    };

    return (
        <CardWrapper $align={align}>
            
            <StyledProfileImage 
                src={finalAvatarUrl} 
            />

            <CardTitle>
                {title}
            </CardTitle>
            
            <HeartsContainer>
                {renderHearts()}
            </HeartsContainer>
            
        </CardWrapper>
    );
};

export default PlayerCard;