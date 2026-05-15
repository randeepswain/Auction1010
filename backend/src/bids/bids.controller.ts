import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './bid.entity';
import { Auction } from '../auctions/auction.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('bids')
export class BidsController {
  constructor(
    @InjectRepository(Bid) private bidsRepository: Repository<Bid>,
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('my-bids')
  async getMyBids(@Req() req: any) {
    const userId = req.user.id;

    // Get all bids by this user, newest first
    const userBids = await this.bidsRepository.find({
      where: { user_id: userId },
      relations: ['auction'],
      order: { timestamp: 'DESC' }
    });

    const uniqueAuctions = new Map<string, any>();

    for (const bid of userBids) {
      if (!uniqueAuctions.has(bid.auction_id) && bid.auction) {
        const auction = bid.auction;

        // Get the user's highest bid for this auction
        const userHighestBid = await this.bidsRepository
          .createQueryBuilder('bid')
          .where('bid.auction_id = :auctionId AND bid.user_id = :userId', {
            auctionId: auction.id,
            userId
          })
          .orderBy('bid.amount', 'DESC')
          .getOne();

        let status = 'Outbid';
        if (auction.status === 'ended' || auction.status === 'allocated') {
          status = auction.winner_id === userId ? 'Won' : 'Lost';
        } else {
          status = userHighestBid && Number(userHighestBid.amount) === Number(auction.current_highest_bid) ? 'Highest Bidder' : 'Outbid';
        }

        uniqueAuctions.set(auction.id, {
          id: auction.id,
          title: auction.title,
          finalPrice: auction.current_highest_bid,
          date: new Date(bid.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status,
          image: auction.image_url
        });
      }
    }

    return Array.from(uniqueAuctions.values());
  }
}
