import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import Redlock from 'redlock';
import { Bid } from './bid.entity';
import { Auction } from '../auctions/auction.entity';

@Injectable()
export class BidsService {
  private redlock: Redlock;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectRepository(Bid) private bidsRepository: Repository<Bid>,
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
  ) {
    this.redlock = new Redlock([redis as any], { retryCount: 3, retryDelay: 50 });
  }

  async processBid(data: { auctionId: string; amount: number; userId: string }) {
    const lockKey = `locks:auction:${data.auctionId}`;
    let lock;

    try {
      // Acquire Lock to prevent race conditions during concurrent bidding
      lock = await this.redlock.acquire([lockKey], 500);

      // Get current highest bid from Redis
      const currentHighestStr = await this.redis.hget(`auction:${data.auctionId}`, 'highest_bid');
      const currentHighest = currentHighestStr ? parseFloat(currentHighestStr) : 0;

      if (data.amount <= currentHighest) {
        throw new BadRequestException('Bid must be higher than current highest bid');
      }

      // Update Redis with new highest bid
      await this.redis.hset(`auction:${data.auctionId}`, {
        highest_bid: data.amount,
        highest_bidder_id: data.userId,
      });

      // Also push to leaderboard sorted set
      await this.redis.zadd(`auction:${data.auctionId}:bids`, data.amount, data.userId);

      // Async DB persist logic
      const dbBid = this.bidsRepository.create({
        amount: data.amount,
        auction_id: data.auctionId,
        user_id: data.userId,
      });
      await this.bidsRepository.save(dbBid);
      await this.auctionsRepository.update(data.auctionId, { current_highest_bid: data.amount });

      return {
        id: dbBid.id,
        amount: data.amount,
        userId: data.userId,
        timestamp: new Date().toISOString()
      };

    } finally {
      if (lock) {
        await (lock as any).release().catch((e: any) => console.error('Failed to release lock', e));
      }
    }
  }

  async updateManualBid(auctionId: string, amount: number, userId: string = 'admin') {
    await this.redis.hset(`auction:${auctionId}`, {
      highest_bid: amount,
      highest_bidder_id: userId,
    });
    await this.redis.zadd(`auction:${auctionId}:bids`, amount, userId);
  }

  async getAuctionHistory(auctionId: string) {
    return this.bidsRepository.find({
      where: { auction_id: auctionId },
      relations: ['user'],
      order: { amount: 'DESC' },
      take: 20
    });
  }
}
