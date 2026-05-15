import { Injectable, BadRequestException, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import Redlock from 'redlock';
import { Bid } from './bid.entity';
import { Auction } from '../auctions/auction.entity';

@Injectable()
export class BidsService {
  private redlock: Redlock | null = null;

  constructor(
    @Inject('REDIS_CLIENT') @Optional() private readonly redis: Redis | null,
    @InjectRepository(Bid) private bidsRepository: Repository<Bid>,
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
  ) {
    if (this.redis) {
      this.redlock = new Redlock([redis as any], { retryCount: 3, retryDelay: 50 });
    }
  }

  async processBid(data: { auctionId: string; amount: number; userId: string }) {
    const lockKey = `locks:auction:${data.auctionId}`;
    let lock: any = null;

    try {
      // Acquire lock if Redis is available
      if (this.redlock) {
        lock = await this.redlock.acquire([lockKey], 500);
      }

      // Get current highest bid
      let currentHighest = 0;
      if (this.redis) {
        const currentHighestStr = await this.redis.hget(`auction:${data.auctionId}`, 'highest_bid');
        currentHighest = currentHighestStr ? parseFloat(currentHighestStr) : 0;
      } else {
        // Fallback: get from database
        const auction = await this.auctionsRepository.findOne({ where: { id: data.auctionId } });
        currentHighest = auction?.current_highest_bid || 0;
      }

      if (data.amount <= currentHighest) {
        throw new BadRequestException('Bid must be higher than current highest bid');
      }

      // Update Redis if available
      if (this.redis) {
        await this.redis.hset(`auction:${data.auctionId}`, {
          highest_bid: data.amount,
          highest_bidder_id: data.userId,
        });
        await this.redis.zadd(`auction:${data.auctionId}:bids`, data.amount, data.userId);
      }

      // Always persist to DB
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
        await lock.release().catch((e: any) => console.error('Failed to release lock', e));
      }
    }
  }

  async updateManualBid(auctionId: string, amount: number, userId: string = 'admin') {
    if (this.redis) {
      await this.redis.hset(`auction:${auctionId}`, {
        highest_bid: amount,
        highest_bidder_id: userId,
      });
      await this.redis.zadd(`auction:${auctionId}:bids`, amount, userId);
    }
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
