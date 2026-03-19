import React from 'react';
import styled from 'styled-components';
import { device } from '../src/utils/device';

// CUSTOM HOOK & COMPONENTS
import useLeaderboardPage from '../src/hooks/useLeaderboardPage';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import LeaderboardTabs from '../components/molecules/LeaderboardTabs';
import LeaderboardTable from '../components/organisms/LeaderboardTable';

// STYLED COMPONENTS
const PageContainer = styled.div`
    min-height: 100vh;
    background-color: #f0fdf4;
    padding-top: 100px;
    padding-bottom: 40px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    font-family: 'Inter', system-ui, sans-serif;
`;

const CardContainer = styled.div`
    background: #ffffff;
    border: 1px solid #dcfce7;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    width: 90%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    @media ${device.tablet}
    {
        padding: 20px;
        width: 95%;
    }
`;

const Title = styled.h1`
    text-align: center;
    color: #14532d;
    font-size: 2.2rem;
    font-weight: 800;
    margin: 0 0 10px 0;
    text-shadow: 0 1px 2px rgba(0,0,0,0.05);

    @media ${device.mobileL}
    {
        font-size: 1.8rem;
    }
`;

// COMPONENT DEFINITION
const LeaderboardPage = () =>
{
    const { mode, setMode, players, loading, modes } = useLeaderboardPage();

    return (
        <PageContainer>
            
            <BackToHomeLink />

            <CardContainer>
                
                <Title>
                    🏆 Hall of Fame
                </Title>

                <LeaderboardTabs 
                    modes={modes} 
                    currentMode={mode} 
                    onModeChange={setMode} 
                />

                <LeaderboardTable 
                    players={players} 
                    loading={loading} 
                    mode={mode} 
                />
                
            </CardContainer>
            
        </PageContainer>
    );
};

export default LeaderboardPage;