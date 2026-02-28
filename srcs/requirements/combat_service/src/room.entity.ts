import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Room
{
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    ownerId: string;

    @Column({ default: 'Unknown Player' })
    ownerName: string;

    @Column({ type: 'varchar', nullable: true })
    guestId: string | null;

    @Column()
    difficulty: string;

    @Column('json', { nullable: true })
    currBoard: any;

    @Column('json', { nullable: true })
    solvedBoard: any;

    @Column('simple-array', { nullable: true })
    health: number[];

    @Column({ default: 'waiting' })
    status: string;
}