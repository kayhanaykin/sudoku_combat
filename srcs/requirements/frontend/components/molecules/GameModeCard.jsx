import Card from '../atoms/Card';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';

const GameModeCard = ({ icon, title, description, onClick }) => {
	return (
		<Card onClick={onClick} className="mode-card-hover-effect">
			<Icon symbol={icon} />
			<div>
				<Typography variant="h2" color="var(--primary)">{title}</Typography>
				<Typography>{description}</Typography>
			</div>
		</Card>
	);
};
export default GameModeCard;
