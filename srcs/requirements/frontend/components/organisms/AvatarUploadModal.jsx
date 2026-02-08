import React, { useState, useEffect } from 'react';
import ProfileImage from '../atoms/ProfileImage';
import '../../styles/Modal.css';

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
    {
        return null;
    }

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
        {
            return;
        }
        
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-icon" onClick={onClose}>✕</button>

                <h2 className="modal-title">Change Avatar</h2>

                {error && (
                    <div style={{ color: '#e74c3c', fontSize: '0.9rem', marginBottom: '10px' }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <ProfileImage 
                        src={previewUrl} 
                        style={{ width: '150px', height: '150px', border: '4px solid #f0f0f0' }} 
                    />
                </div>

                <input 
                    type="file" 
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={isLoading}
                />
                
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '20px' }}>
                    Supported: JPG, PNG (Max 2MB)
                </p>

                <div className="modal-actions">
                    <button 
                        className="modal-btn primary" 
                        onClick={handleSubmit}
                        disabled={!selectedFile || isLoading}
                        style={{ opacity: (!selectedFile || isLoading) ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Uploading...' : 'Save'}
                    </button>
                    
                    <button 
                        className="modal-btn secondary" 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarUploadModal;