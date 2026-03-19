import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../src/context/AuthContext';
import { loginUser } from '../../services/api';

const INTRA_AUTH_URL = "/api/user/auth/login/";

// ANIMATIONS
const fadeIn = keyframes`
    from 
    { 
        opacity: 0; 
        transform: translateY(-20px); 
    }
    to 
    { 
        opacity: 1; 
        transform: translateY(0); 
    }
`;

// STYLED COMPONENTS
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-family: inherit;
`;

const ModalContainer = styled.div`
    background-color: var(--secondary);
    padding: 2rem;
    border-radius: var(--radius-md);
    width: 350px;
    box-shadow: var(--shadow-sm);
    position: relative;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Title = styled.h2`
    margin-bottom: 1.5rem;
    text-align: center;
    color: var(--text-dark);
    margin-top: 0;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ErrorMessage = styled.div`
    color: #e74c3c;
    text-align: center;
    font-size: 0.9rem;
    margin-bottom: 10px;
`;

const Input = styled.input`
    padding: 10px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
    font-size: 1rem;
    background-color: #fff;
    width: 100%;
    box-sizing: border-box;

    &:focus
    {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.2);
    }
    
    &:disabled
    {
        background-color: #f3f4f6;
        cursor: not-allowed;
    }
`;

const SubmitButton = styled.button`
    padding: 10px;
    background-color: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-weight: bold;
    transition: background-color 0.2s, opacity 0.2s;
    width: 100%;
    
    cursor: ${props => 
    {
        if (props.disabled)
            return 'not-allowed';
            
        return 'pointer';
    }};

    opacity: ${props => 
    {
        if (props.disabled)
            return '0.7';
            
        return '1';
    }};

    &:hover
    {
        background-color: ${props => 
        {
            if (props.disabled)
                return 'var(--primary)';
                
            return 'var(--primary-hover)';
        }};
    }
`;

const Divider = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1rem 0;
    color: #aaa;
    font-size: 0.8rem;

    &::before,
    &::after
    {
        content: '';
        flex: 1;
        border-bottom: 1px solid #ddd;
    }

    span
    {
        padding: 0 10px;
    }
`;

const IntraButton = styled.button`
    padding: 10px;
    background-color: #000000;
    color: #ffffff;
    border: none;
    border-radius: var(--radius-sm, 6px);
    font-size: 1rem;
    font-weight: bold;
    transition: opacity 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;

    cursor: ${props => 
    {
        if (props.disabled)
            return 'not-allowed';
            
        return 'pointer';
    }};
    
    opacity: ${props => 
    {
        if (props.disabled)
            return '0.7';
            
        return '1';
    }};

    &:hover
    {
        opacity: ${props => 
        {
            if (props.disabled)
                return '0.7';
                
            return '0.9';
        }};
    }
`;

const FooterContainer = styled.div`
    margin-top: 15px;
    text-align: center;
    font-size: 0.9rem;
    color: #666;
`;

const SignupButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    cursor: pointer;
    font-weight: bold;
    text-decoration: underline;
    padding: 0 5px;
    font-size: 0.9rem;
`;

const CloseButton = styled.button`
    margin-top: 1rem;
    background: none;
    border: none;
    color: var(--text-muted);
    width: 100%;
    text-decoration: underline;
    font-size: 0.9rem;

    cursor: ${props => 
    {
        if (props.disabled)
            return 'not-allowed';
            
        return 'pointer';
    }};

    &:hover
    {
        color: ${props => 
        {
            if (props.disabled)
                return 'var(--text-muted)';
                
            return 'var(--text-dark)';
        }};
    }
`;

// COMPONENT DEFINITION
const Login = ({ isOpen, onClose, onSwitchToSignup }) => 
{
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen)
        return null;

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try
        {
            const userData = await loginUser(username, password);
            login(userData);
            onClose();
        }
        catch (err)
        {
            if (err.message)
                setError(err.message);
            else
                setError("Login failed");
        }
        finally
        {
            setIsLoading(false);
        }
    };

    const handleIntraLogin = () => 
    {
        window.location.href = INTRA_AUTH_URL;
    };

    const handleSwitchToSignup = () =>
    {
        onClose();
        
        if (onSwitchToSignup)
            onSwitchToSignup();
    };

    let submitButtonText = 'Log In';
    if (isLoading)
        submitButtonText = 'Logging in...';

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                
                <Title>
                    Log In
                </Title>
                
                <Form onSubmit={handleSubmit}>
                    
                    {error && 
                    (
                        <ErrorMessage>
                            {error}
                        </ErrorMessage>
                    )}

                    <Input 
                        type="text" 
                        placeholder="Username or Email" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    
                    <Input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    
                    <SubmitButton type="submit" disabled={isLoading}>
                        {submitButtonText}
                    </SubmitButton>

                    <Divider>
                        <span>OR</span>
                    </Divider>

                    <IntraButton 
                        type="button" 
                        onClick={handleIntraLogin}
                        disabled={isLoading}
                    >
                        Sign in with 42
                    </IntraButton>
                    
                </Form>

                <FooterContainer>
                    <span>Don't have an account? </span>
                    <SignupButton type="button" onClick={handleSwitchToSignup}>
                        Sign up
                    </SignupButton>
                </FooterContainer>

                <CloseButton onClick={onClose} disabled={isLoading}>
                    Close
                </CloseButton>
                
            </ModalContainer>
        </Overlay>
    );
};

export default Login;