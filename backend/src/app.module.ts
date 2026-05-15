import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsModule } from './bids/bids.module';
import { EventsModule } from './events/events.module';
import { User } from './users/user.entity';
import { Auction } from './auctions/auction.entity';
import { Bid } from './bids/bid.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuctionsModule } from './auctions/auctions.module';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // Support unified connection string
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'auction_user',
      password: process.env.POSTGRES_PASSWORD || 'secretpassword',
      database: process.env.POSTGRES_DB || 'auction_db',
      entities: [User, Auction, Bid],
      synchronize: true, // Enable for now to auto-create tables on Render
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    BidsModule, 
    EventsModule, UsersModule, AuthModule, AuctionsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL;
        const redisHost = process.env.REDIS_HOST;

        // If no Redis config is provided, return null (Redis is optional)
        if (!redisUrl && !redisHost) {
          console.warn('⚠️  No Redis configuration found. Running without Redis (DB-only mode).');
          return null;
        }

        if (redisUrl) {
          return new Redis(redisUrl);
        }
        return new Redis({
          host: redisHost || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class AppModule {}
