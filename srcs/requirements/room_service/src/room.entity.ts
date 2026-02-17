import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rooms')
export class Room
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	ownerId: string;

	@Column({ nullable: true, type: 'varchar' })
	guestId: string | null;

	@Column({ type: 'json' })
	solvedBoard: number[][];

	@Column({ type: 'json' })
	currBoard: number[][];

	@Column({ type: 'json' })
	health:number[];

	@Column({ default: 'waiting' })
	status: string
}
