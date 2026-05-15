import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  starting_bid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  current_highest_bid: number;

  @Column({ nullable: true })
  start_time: Date;

  @Column({ nullable: true })
  end_time: Date;

  @Column({ default: 60 })
  duration_minutes: number;

  @Column({ default: 100 })
  max_users: number;

  @Column({ default: 'active' }) // 'active', 'ended', 'allocated'
  status: string;

  @Column({ type: 'varchar', nullable: true })
  image_url: string;

  @Column({ type: 'varchar', nullable: true })
  winner_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
