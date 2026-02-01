import React from 'react';

const ProfileImage = ({ src, alt }) => {
  return (
    <div className="a-profile-image-container">
      <img 
        src={src || "https://via.placeholder.com/200"} 
        alt={alt} 
        className="a-profile-image"
      />
    </div>
  );
};
export default ProfileImage;