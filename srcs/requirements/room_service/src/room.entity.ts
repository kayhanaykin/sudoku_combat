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

	@Column()
	solvedBoard: number[][];

	@Column()
	currBoard: number[][];

	@Column()
	health:number[];

	@Column({ default: 'waiting' })
	status: string
}
