import React, { useState, useEffect } from 'react';
import ProfileImage from '../atoms/ProfileImage';
import '../../styles/EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose, currentUserData, onSave }) =>
{
    const [displayName, setDisplayName] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>
    {
        if (isOpen && currentUserData)
        {
            setDisplayName(currentUserData.nickname || currentUserData.display_name || '');
            setPreviewUrl(currentUserData.avatar || null);
            setSelectedFile(null);
        }
    }, [isOpen, currentUserData]);

    if (!isOpen)
    {
        return null;
    }

    const handleFileChange = (e) =>
    {
        const file = e.target.files[0];
        if (file)
        {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () =>
    {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('display_name', displayName);
        
        if (selectedFile)
        {
            formData.append('avatar', selectedFile);
        }

        await onSave(formData);
        setIsLoading(false);
    };

    return (
        <div className="ep-overlay" onClick={onClose}>
            <div className="ep-card" onClick={(e) => e.stopPropagation()}>
                
                <div className="ep-header">
                    <h3>
                        Edit Profile
                    </h3>
                    <button className="ep-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="ep-body">
                    <div className="ep-avatar-section">
                        <label className="ep-avatar-wrapper">
                            <ProfileImage 
                                src={previewUrl} 
                                style={{ width: '100%', height: '100%' }} 
                            />
                            <div className="ep-avatar-overlay">
                                <span className="ep-avatar-icon">
                                    📷
                                </span>
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <span className="ep-hint">
                            Tap photo to change
                        </span>
                    </div>

                    <div className="ep-form-group">
                        <label className="ep-label">
                            Display Name
                        </label>
                        <input 
                            className="ep-input"
                            type="text" 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="How should we call you?"
                            maxLength={20}
                        />
                    </div>

                    <div className="ep-form-group">
                        <label className="ep-label">
                            Username
                        </label>
                        <input 
                            className="ep-input"
                            type="text" 
                            value={`@${currentUserData?.username || ''}`} 
                            disabled 
                        />
                    </div>
                </div>

                <div className="ep-footer">
                    <button className="ep-btn ep-btn-cancel" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button className="ep-btn ep-btn-save" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EditProfileModal;