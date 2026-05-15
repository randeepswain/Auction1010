import { createConnection } from 'typeorm';
import { User } from './users/user.entity';
import { Auction } from './auctions/auction.entity';
import { Bid } from './bids/bid.entity';

async function approveAll() {
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'auction_user',
    password: process.env.POSTGRES_PASSWORD || 'secretpassword',
    database: process.env.POSTGRES_DB || 'auction_db',
    entities: [User, Auction, Bid],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const usersRepo = connection.getRepository(User);
  const result = await usersRepo.update({}, { status: 'approved' });
  
  console.log(`✅ Approved ${result.affected} users.`);
  await connection.close();
  process.exit(0);
}

approveAll().catch(err => { console.error(err); process.exit(1); });
