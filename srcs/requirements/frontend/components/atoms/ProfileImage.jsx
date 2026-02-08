import React, { useState, useEffect } from 'react';
import '../../styles/ProfileImage.css';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";

const ProfileImage = ({ src, alt = "Avatar", className = "", style = {}, onClick }) => 
{
    const [imgSrc, setImgSrc] = useState(src || DEFAULT_AVATAR);

    useEffect(() => 
    {
        setImgSrc(src || DEFAULT_AVATAR);
    }, [src]);

    const handleError = () => 
    {
        if (imgSrc !== DEFAULT_AVATAR)
        {
            setImgSrc(DEFAULT_AVATAR);
        }
    };

    return (
        <div 
            className={`a-profile-image-container ${className}`} 
            onClick={onClick}
            style={style} 
        >
            <img 
                src={imgSrc} 
                alt={alt} 
                className="a-profile-img"
                onError={handleError}
            />
            {onClick && <div className="a-profile-overlay"><span>Change</span></div>}
        </div>
    );
};

export default ProfileImage;