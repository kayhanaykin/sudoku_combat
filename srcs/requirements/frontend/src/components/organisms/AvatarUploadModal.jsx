import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import ProfileImage from '../atoms/ProfileImage';

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
    backdrop-filter: blur(3px);
`;

const ModalBox = styled.div`
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    animation: ${fadeIn} 0.3s ease-out;
`;

const CloseIcon = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #999;
    transition: color 0.2s;

    &:hover
    {
        color: #333;
    }
`;

const ModalTitle = styled.h2`
    margin-bottom: 20px;
    color: #333;
    font-size: 1.5rem;
    font-weight: 700;
`;

const ErrorMessage = styled.div`
    color: #e74c3c;
    font-size: 0.9rem;
    margin-bottom: 10px;
    text-align: center;
`;

const AvatarPreviewContainer = styled.div`
    margin-bottom: 20px;
`;

const StyledProfileImage = styled(ProfileImage)`
    width: 150px !important;
    height: 150px !important;
    border: 4px solid #f0f0f0 !important;
`;

const FileInput = styled.input`
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
    box-sizing: border-box;

    &:disabled
    {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const HelpText = styled.p`
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 20px;
`;

const ActionsContainer = styled.div`
    display: flex;
    gap: 10px;
    width: 100%;
    margin-top: 20px;
`;

const BaseButton = styled.button`
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;

    &:disabled
    {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const PrimaryButton = styled(BaseButton)`
    background-color: #2ecc71;
    color: white;

    &:hover:not(:disabled)
    {
        background-color: #27ae60;
    }
`;

const SecondaryButton = styled(BaseButton)`
    background-color: #95a5a6;
    color: white;

    &:hover:not(:disabled)
    {
        background-color: #7f8c8d;
    }
`;

// COMPONENT DEFINITION
const AvatarUploadModal = ({ isOpen, onClose, currentAvatarUrl, onUpload }) => 
{
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => 
    {
        if (isOpen)
        {
            setPreviewUrl(currentAvatarUrl);
            setSelectedFile(null);
            setError(null);
        }
    }, [isOpen, currentAvatarUrl]);

    if (!isOpen)
        return null;

    const handleFileChange = (e) => 
    {
        const file = e.target.files[0];
        if (file)
        {
            if (file.size > 5 * 1024 * 1024)
            {
                setError("File size cannot exceed 5MB.");
                return;
            }
            setError(null);
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => 
    {
        if (!selectedFile)
            return;
        
        setIsLoading(true);
        try
        {
            await onUpload(selectedFile);
        }
        catch (err)
        {
            setError("An error occurred during upload.");
        }
        finally
        {
            setIsLoading(false);
        }
    };

    // LOGIC-DRIVEN RENDERING
    let submitButtonText = 'Save';
    if (isLoading)
        submitButtonText = 'Uploading...';

    let errorElement = null;
    if (error)
    {
        errorElement = (
            <ErrorMessage>
                {error}
            </ErrorMessage>
        );
    }

    let isSubmitDisabled = false;
    if (!selectedFile || isLoading)
        isSubmitDisabled = true;

    return (
        <Overlay onClick={onClose}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
                
                <CloseIcon onClick={onClose}>
                    ✕
                </CloseIcon>

                <ModalTitle>
                    Change Avatar
                </ModalTitle>

                {errorElement}

                <AvatarPreviewContainer>
                    <StyledProfileImage src={previewUrl} />
                </AvatarPreviewContainer>

                <FileInput 
                    type="file" 
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
                
                <HelpText>
                    Supported: JPG, PNG (Max 5MB)
                </HelpText>

                <ActionsContainer>
                    
                    <PrimaryButton 
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                    >
                        {submitButtonText}
                    </PrimaryButton>
                    
                    <SecondaryButton 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </SecondaryButton>
                    
                </ActionsContainer>
                
            </ModalBox>
        </Overlay>
    );
};

export default AvatarUploadModal;