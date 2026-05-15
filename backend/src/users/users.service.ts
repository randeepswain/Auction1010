import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { created_at: 'DESC' } });
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async approve(id: string): Promise<void> {
    await this.usersRepository.update(id, { status: 'approved' });
  }

  async updateProfile(id: string, data: { name?: string; age?: number; valorant_agent_icon?: string }): Promise<User | null> {
    await this.usersRepository.update(id, data);
    return this.findById(id);
  }

  async incrementWins(userId: string, amount: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;
    
    await this.usersRepository.update(userId, {
      bids_won: (user.bids_won || 0) + 1,
      total_spend: Number(user.total_spend || 0) + Number(amount)
    });
  }
}
