import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import BackToHomeLink from '../components/atoms/BackToHomeLink';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
    padding: 40px 20px;
    max-width: 800px;
    margin: 0 auto;
    font-family: 'Inter', sans-serif;
    color: #374151;
    line-height: 1.6;
    background-color: #f8f9fa;
    min-height: 100vh;
`;

const ContentWrapper = styled.div`
    background: #ffffff;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);

    h1, h2, h3
    {
        color: #14532d;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
    }

    h1
    {
        font-size: 2.2rem;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 10px;
    }

    h2
    {
        font-size: 1.8rem;
    }

    p
    {
        margin-bottom: 1em;
    }
    
    a
    {
        color: #15803d;
        text-decoration: none;
        &:hover
        {
            text-decoration: 
            underline;
        }
    }

    ul, ol
    {
        margin-left: 20px;
        margin-bottom: 1em;
    }
`;

// --- COMPONENT ---
const PolicyPage = ({ content }) => {
    return (
        <PageContainer>
            <BackToHomeLink />
            <ContentWrapper>
                <ReactMarkdown>{content}</ReactMarkdown>
            </ContentWrapper>
        </PageContainer>
    );
};

export default PolicyPage;