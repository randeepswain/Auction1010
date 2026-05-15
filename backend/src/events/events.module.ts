import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { BidsModule } from '../bids/bids.module';
import { AuctionsModule } from '../auctions/auctions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [BidsModule, AuctionsModule, UsersModule],
  providers: [EventsGateway],
})
export class EventsModule {}
