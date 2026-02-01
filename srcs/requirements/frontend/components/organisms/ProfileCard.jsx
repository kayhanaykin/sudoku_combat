const ProfileCard = ({ user, extendedData, onLogout }) => {
    const SidebarWithImage = () => (
        <div style={styles.column}>
          <ProfileImageContainer src={extendedData?.avatarUrl} alt={user?.username} />
          <ProfileButton text="Edit Profile" onClick={() => {}} />
          <ProfileButton text="Settings" onClick={() => {}} />
          <ProfileButton text="Leaderboard" onClick={() => {}} />
          <ProfileButton text="Game History" onClick={() => {}} />
          <ProfileButton text="Achievements" onClick={() => {}} />
           <div style={{ marginTop: '20px' }}>
             <ProfileButton text="Log Out" onClick={onLogout} variant="danger" />
           </div>
        </div>
      );

  return (
    <div style={styles.cardContainer}>
      <SidebarWithImage />
      <UserInfoSection user={user} extendedData={extendedData} />
      <FriendRightbar />
    </div>
  );
};