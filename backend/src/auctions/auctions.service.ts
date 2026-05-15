import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './auction.entity';
import { Bid } from '../bids/bid.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private auctionsRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>,
    private usersService: UsersService,
  ) {}

  async create(data: Partial<Auction>): Promise<Auction> {
    const auction = this.auctionsRepository.create({
      ...data,
      current_highest_bid: data.starting_bid || 0,
    });
    return this.auctionsRepository.save(auction);
  }

  async findAll(): Promise<Auction[]> {
    return this.auctionsRepository.find({ order: { created_at: 'DESC' } });
  }

  async findById(id: string): Promise<Auction | null> {
    return this.auctionsRepository.findOne({ where: { id } });
  }

  async updateHighestBid(id: string, amount: number): Promise<void> {
    await this.auctionsRepository.update(id, { current_highest_bid: amount });
  }

  async delete(id: string): Promise<void> {
    await this.auctionsRepository.delete(id);
  }

  async fetchSkinImage(title: string): Promise<string | undefined> {
    try {
      const response = await fetch('https://valorant-api.com/v1/weapons/skins');
      const data = await response.json();
      if (data && data.data) {
        // Find by exact title or partial match
        const skin = data.data.find((s: any) => 
          s.displayName.toLowerCase() === title.toLowerCase() ||
          s.displayName.toLowerCase().includes(title.toLowerCase())
        );
        return skin?.displayIcon;
      }
    } catch (error) {
      console.error('Error fetching skin image:', error);
    }
    return undefined;
  }

  async launchAuction(id: string): Promise<Auction> {
    const auction = await this.findById(id);
    if (!auction) throw new Error('Auction not found');
    
    const now = new Date();
    const duration = auction.duration_minutes || 60;
    const endTime = new Date(now.getTime() + duration * 60000);
    
    auction.status = 'active';
    auction.start_time = now;
    auction.end_time = endTime;
    
    return this.auctionsRepository.save(auction);
  }

  async update(id: string, data: Partial<Auction>): Promise<Auction> {
    const { id: _, created_at: __, updated_at: ___, ...updateData } = data as any;
    await this.auctionsRepository.update(id, updateData);
    const updated = await this.findById(id);
    if (!updated) throw new Error('Auction not found');
    return updated;
  }

  async finalizeAuction(id: string): Promise<void> {
    const auction = await this.findById(id);
    if (!auction || auction.status !== 'active') return;

    const highestBid = await this.bidsRepository.createQueryBuilder('bid')
      .where('bid.auction_id = :id', { id })
      .orderBy('bid.amount', 'DESC')
      .getOne();

    if (highestBid) {
      await this.auctionsRepository.update(id, {
        status: 'ended',
        winner_id: highestBid.user_id
      } as any);

      // Update user stats
      await this.usersService.incrementWins(highestBid.user_id, Number(highestBid.amount));
    } else {
      await this.auctionsRepository.update(id, {
        status: 'ended',
        winner_id: null
      } as any);
    }
  }
}
