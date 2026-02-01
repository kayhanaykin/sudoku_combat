import React from 'react';
import StatRow from '../atoms/StatRow';

const ProfileInfo = ({ userDetails, stats }) => {
  return (
    <>
      <div style={{ marginBottom: '40px' }}>
        <StatRow label="Nickname" value={userDetails?.nickname} />
        <StatRow label="e-mail" value={userDetails?.email} />
      </div>

      <div>
        <StatRow label="Total game" value={stats?.totalGames} />
        <StatRow label="Win rate" value={stats?.winRate} />
        
        <div style={{ marginTop: '20px' }}>
          <StatRow label="Easy" value={stats?.ranks?.easy} indent />
          <StatRow label="Medium" value={stats?.ranks?.medium} indent />
          <StatRow label="Hard" value={stats?.ranks?.hard} indent />
          <StatRow label="Expert" value={stats?.ranks?.expert} indent />
        </div>
      </div>
    </>
  );
};
export default ProfileInfo;