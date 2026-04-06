import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import BackToHomeLink from '../components/atoms/BackToHomeLink';

const PageContainer = styled.div`
    padding: 10px 10px 40px;
    max-width: 800px;
    margin: 0 auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #4b5563;
    line-height: 1.6;
    background-color: #f9fafb;
    min-height: 100vh;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px)
    {
        padding: 20px 15px;
    }
`;

const ContentWrapper = styled.div`
    background: #ffffff;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-top: 20px;

    h1, h2, h3, h4, h5, h6
    {
        color: #111827;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: bold;
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
        color: #27ae60;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;

        &:hover
        {
            color: #1e8449;
            text-decoration: underline;
        }
    }

    ul, ol
    {
        margin-left: 20px;
        margin-bottom: 1em;
    }

    @media (max-width: 480px)
    {
        padding: 24px;
        
        h1
        {
            font-size: 1.8rem;
        }
        
        h2
        {
            font-size: 1.5rem;
        }
    }
`;

const PolicyPage = ({ content }) => 
{
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