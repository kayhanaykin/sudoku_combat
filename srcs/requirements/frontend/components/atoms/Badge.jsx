const Badge = ({ rank }) => {
  let color = '#bdc3c7'; // Varsayılan
  if (rank === 1) color = 'var(--gold)';
  if (rank === 2) color = 'var(--silver)';
  if (rank === 3) color = 'var(--bronze)';

  return (
    <span style={{ fontWeight: 800, width: '30px', color: color }}>
      {rank}
    </span>
  );
};
export default Badge;