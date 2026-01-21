const Icon = ({ symbol, size = '3rem', bg = '#f4f6f7' }) => {
	return (
		<span style={{
			fontSize: size,
			backgroundColor: bg,
			width: '80px', 
			height: '80px',
			display: 'flex', 
			alignItems: 'center', 
			justifyContent: 'center',
			borderRadius: '50%'
		}}>
			{symbol}
		</span>
	);
};

export default Icon;
