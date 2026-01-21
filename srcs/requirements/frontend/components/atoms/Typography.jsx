const Typography = ({ variant = 'body', children, color }) => {
	const styles = { color: color || 'inherit' };
	if (variant === 'h2')
		return <h2 style={{...styles, fontSize: '1.5rem', fontWeight: 800}}>{children}</h2>;
	if (variant === 'h3')
		return <h3 style={{...styles, fontSize: '1.2rem', textTransform: 'uppercase'}}>{children}</h3>;
	return <p style={{...styles, fontSize: '0.9rem', color: 'var(--text-muted)'}}>{children}</p>;
};

export default Typography;
