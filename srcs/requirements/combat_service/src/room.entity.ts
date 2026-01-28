import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rooms')
export class Room
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	ownerId: string;

	@Column({ nullable: true })
	guestId: string | null;

	@Column({ default: 'waiting' })
	status: string
}
