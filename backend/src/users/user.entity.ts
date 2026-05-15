import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ default: 'user' })
  role: string; // 'user' | 'admin'

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_spend: number;

  @Column({ default: 'approved' })
  status: string; // 'pending' | 'approved' | 'banned'

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'int', default: 0 })
  bids_won: number;

  @Column({ nullable: true })
  valorant_agent_icon: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
