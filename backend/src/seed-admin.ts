import { createConnection } from 'typeorm';
import { Auction } from './auctions/auction.entity';
import { Bid } from './bids/bid.entity';
import { User } from './users/user.entity';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
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

  // Check if admin00 already exists
  const existing = await usersRepo.findOne({ where: { email: 'admin00' } });
  if (existing) {
    await usersRepo.update(existing.id, { role: 'admin', status: 'approved' });
    console.log('✅ admin00 role confirmed as admin');
  } else {
    const hash = await bcrypt.hash('admin00pass', 10);
    const admin = usersRepo.create({
      name: 'admin00',
      email: 'admin00',
      password_hash: hash,
      role: 'admin',
      status: 'approved',
      total_spend: 0,
    });
    await usersRepo.save(admin);
    console.log('✅ Created admin00 account (email: admin00, password: admin00pass)');
  }

  await connection.close();
  process.exit(0);
}

seedAdmin().catch(err => { console.error(err); process.exit(1); });
