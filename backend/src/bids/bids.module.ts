import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { Bid } from './bid.entity';
import { Auction } from '../auctions/auction.entity';

import { BidsController } from './bids.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Auction])],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}
