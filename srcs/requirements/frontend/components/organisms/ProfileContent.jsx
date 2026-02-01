import React, { useState } from 'react';
import BadgeWidget from '../molecules/BadgeWidget';
import InfoBadge from '../atoms/InfoBadge';
import '../../styles/ProfileContent.css';

const ProfileContent = ({ userDetails, stats, onLogout, onDeleteAccount }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: userDetails?.nickname || '',
    email: userDetails?.email || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
  const detailedStats = difficulties.map(diff => {
    const played = stats?.ranks?.[diff.toLowerCase()]?.played || 0;
    const won = stats?.ranks?.[diff.toLowerCase()]?.won || 0;
    const bestTime = stats?.ranks?.[diff.toLowerCase()]?.bestTime || '-';
    const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
    
    return { name: diff, played, won, winRate, bestTime };
  });

  const totalPlayed = detailedStats.reduce((acc, curr) => acc + curr.played, 0);
  const totalWon = detailedStats.reduce((acc, curr) => acc + curr.won, 0);
  const totalWinRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

  return (
    <div className="o-dashboard-container">

      <div className="o-profile-grid">
        
        <div className="profile-card-base m-profile-column">
          <div className="a-profile-header">
            <img 
              src={userDetails?.avatar || "https://via.placeholder.com/150"} 
              alt="Avatar" 
              className="a-profile-avatar"
            />
            
            <div className="profile-info-edit-area">
              {isEditing ? (
                <>
                  <input 
                    type="text" 
                    name="nickname"
                    value={formData.nickname} 
                    onChange={handleChange}
                    className="profile-edit-input title-input"
                    placeholder="Nickname"
                  />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleChange}
                    className="profile-edit-input"
                    placeholder="Email"
                  />
                </>
              ) : (
                <>
                  <h2 className="a-profile-name">{formData.nickname}</h2>
                  <p className="a-profile-email">{formData.email}</p>
                </>
              )}
            </div>

            <div style={{ marginTop: '10px' }}>
              <InfoBadge 
                text={userDetails?.isOnline ? "Online" : "Offline"} 
                type={userDetails?.isOnline ? "online" : "offline"} 
              />
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="green-btn" onClick={handleSave}>Save</button>
                <button className="green-btn outline" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            ) : (
              <button className="green-btn outline" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
            
            <button className="green-btn outline">History</button>
            
            <div className="divider-line"></div>

            <button 
                className="green-btn danger-btn" 
                onClick={onLogout}
            >
                Log Out
            </button>

            <button 
                className="text-btn-danger" 
                onClick={onDeleteAccount}
            >
                Delete Account
            </button>
          </div>
        </div>

        <div className="profile-card-base m-friend-section">
          <h3>Friend List</h3>
          <div className="empty-state-box">
              <p>No friends online currently.</p>
              <button className="green-btn small">Add Friend</button>
          </div>
        </div>

        <BadgeWidget />

      </div>

      <div className="profile-card-base o-stats-section">
        <h3 className="section-title">Performance Statistics</h3>
        
        <div className="stats-table-wrapper">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Difficulty</th>
                <th>Games Played</th>
                <th>Won</th>
                <th>Win Rate</th>
                <th>Best Time</th>
              </tr>
            </thead>
            <tbody>
              {detailedStats.map((row) => (
                <tr key={row.name}>
                  <td className="diff-cell">
                    <span className={`diff-dot ${row.name.toLowerCase()}`}></span>
                    {row.name}
                  </td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>
                    <div className="win-rate-bar-container">
                      <span style={{width: '40px'}}>{row.winRate}%</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${row.winRate}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>{row.bestTime}</td>
                </tr>
              ))}
              
              <tr className="total-row">
                <td><strong>TOTAL</strong></td>
                <td><strong>{totalPlayed}</strong></td>
                <td><strong>{totalWon}</strong></td>
                <td><strong>{totalWinRate}%</strong></td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ProfileContent;