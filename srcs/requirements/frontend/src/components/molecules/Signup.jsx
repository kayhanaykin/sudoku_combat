import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext'; // Login'deki gibi AuthContext'i ekledik
import { registerUser, loginUser, API_BASE_URL } from '../../services/api';

const INTRA_REGISTER_URL = `${API_BASE_URL}/api/user/auth/login/`;

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

// STYLED COMPONENTS (Tasarımına dokunulmadı)
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-family: inherit;
`;

const ModalContainer = styled.div`
    background-color: #ffffff;
    padding: 2.5rem 1.8rem;
    border-radius: 16px;
    width: 380px;
    height: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    position: relative;
    animation: ${fadeIn} 0.3s ease-out;
    box-sizing: border-box;
`;

const Title = styled.h2`
    margin-bottom: 1.5rem;
    text-align: center;
    color: #15c65c;
    margin-top: 0;
    font-size: 1.8rem;
    font-weight: 800;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Input = styled.input`
    padding: 14px;
    border-radius: 8px;
    border: 2px solid #d1d5db;
    font-size: 1rem;
    background-color: #f9fafb;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.2s;
    color: #374151;

    &:focus
    {
        outline: none;
        border-color: #50ee8a;
        background-color: #ffffff;
        box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2);
    }

    &:disabled
    {
        background-color: #f3f4f6;
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

const SubmitButton = styled.button`
    padding: 14px;
    background-color: #15c65c;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: bold;
    text-align: center;
    transition: all 0.2s;
    width: 100%;
    margin-top: 10px;

    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? '0.7' : '1'};

    &:hover
    {
        background-color: ${props => props.disabled ? '#0e7c3a' : '#149345'};
        transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    }
`;

const Divider = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1.2rem 0;
    color: #9ca3af;
    font-size: 1rem;
    font-weight: 650;

    &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #e5e7eb;
    }
    span { padding: 0 10px; }
`;

const IntraButton = styled.button`
    padding: 14px;
    background-color: #000000;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 1.05rem;
    font-weight: bold;
    transition: all 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;

    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? '0.7' : '1'};

    &:hover
    {
        opacity: ${props => props.disabled ? '0.7' : '0.85'};
        transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    }
`;

const FooterContainer = styled.p`
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.95rem;
    color: #4b5563;
`;

const LoginLink = styled.span`
    color: #15803d;
    cursor: pointer;
    font-weight: bold;
    &:hover { text-decoration: underline; }
`;

const CloseButton = styled.button`
    margin-top: 1rem;
    background: none;
    border: none;
    color: #6b7280;
    width: 100%;
    text-decoration: underline;
    cursor: pointer;
`;

const ErrorAlert = styled.div`
    color: #b91c1c;
    background-color: #fef2f2;
    border: 1px solid #f87171;
    padding: 10px;
    border-radius: 8px;
    font-size: 0.9rem;
    margin-bottom: 10px;
    font-weight: 600;
`;

// COMPONENT DEFINITION
const SignUp = ({ isOpen, onClose, onSwitchToLogin }) => 
{
    const { login } = useAuth(); // Login.jsx'teki aynı hook kullanımı
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen)
        return null;

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword)
        {
            setError("Passwords do not match!");
            return;
        }

        setIsLoading(true);

        try
        {
            // 1. Kayıt Ol
            await registerUser(username, email, password);
            
            // 2. Login.jsx'teki gibi loginUser'ı çağır
            const userData = await loginUser(username, password);
            
            // 3. Login.jsx'teki gibi Context'teki login fonksiyonunu çalıştır
            // Bu fonksiyon hem tokenları kaydeder hem de state'i günceller.
            login(userData);
            
            // 4. Modalı kapat
            onClose();
        }
        catch (err)
        {
            console.error(err);
            setError(err.message || "An error occurred.");
        }
        finally
        {
            setIsLoading(false);
        }
    };

    const handleIntraRegister = () => 
    {
        window.location.href = `/api/user/auth/login/`;
    };

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <Title>Sign Up</Title>
                
                <Form onSubmit={handleSubmit}>
                    {error && <ErrorAlert>{error}</ErrorAlert>}

                    <Input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <Input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

                    <Input 
                        type="password" 
                        placeholder="Confirm Password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    
                    <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </SubmitButton>

                    <Divider><span>OR</span></Divider>

                    <IntraButton type="button" onClick={handleIntraRegister} disabled={isLoading}>
                        Sign up with 42
                    </IntraButton>
                </Form>
                
                <FooterContainer>
                    Already have an account?{' '}
                    <LoginLink onClick={onSwitchToLogin}>Log In</LoginLink>
                </FooterContainer>

                <CloseButton onClick={onClose} disabled={isLoading}>Close</CloseButton>
            </ModalContainer>
        </Overlay>
    );
};

export default SignUp;