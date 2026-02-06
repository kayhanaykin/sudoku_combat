import React, { useState, useEffect, useRef } from 'react';
import ProfileImage from '../atoms/ProfileImage';
import '../../styles/Modal.css';

const EditProfileModal = ({ isOpen, onClose, currentUserData, onSave }) => 
{
    const [nickname, setNickname] = useState('');
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => 
    {
        if (isOpen && currentUserData)
        {
            setNickname(currentUserData.nickname || '');
            setPreviewAvatar(currentUserData.avatar);
            setSelectedFile(null);
            setIsLoading(false);
        }
    }, [isOpen, currentUserData]);

    if (!isOpen)
        return null;

    const handleFileChange = (e) => 
    {
        const file = e.target.files[0];
        if (file)
        {
            setSelectedFile(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handleAvatarClick = () => 
    {
        fileInputRef.current.click();
    };

    const handleSubmit = async () => 
    {
        setIsLoading(true);
        await onSave(nickname, selectedFile);
        setIsLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-icon" onClick={onClose}>✕</button>

                <h2 className="modal-title">Edit Profile</h2>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
                    
                    {/* Avatar Section */}
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleAvatarClick}>
                        <ProfileImage 
                            src={previewAvatar} 
                            style={{ width: '120px', height: '120px', border: '4px solid #f0f0f0' }} 
                        />
                        <div className="a-profile-overlay" style={{ borderRadius: '50%' }}>
                            <span>Change</span>
                        </div>
                    </div>
                    
                    {/* Hidden Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />

                    {/* Nickname Input */}
                    <div style={{ width: '100%' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>
                            Nickname
                        </label>
                        <input 
                            type="text" 
                            className="profile-edit-input"
                            style={{ width: '100%', textAlign: 'left' }}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Enter your nickname"
                        />
                    </div>

                    <div className="modal-actions">
                        <button 
                            className="modal-btn primary" 
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
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
        </div>
    );
};

export default EditProfileModal;