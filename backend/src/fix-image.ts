import { createConnection } from 'typeorm';
import { Auction } from './auctions/auction.entity';
import { Bid } from './bids/bid.entity';
import { User } from './users/user.entity';

async function fixPrimePhantom() {
  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'auction_user',
    password: 'secretpassword',
    database: 'auction_db',
    entities: [User, Auction, Bid],
  });

  await connection.getRepository(Auction).update(
    { title: 'Prime Phantom' },
    { image_url: 'https://media.valorant-api.com/weaponskins/44b7b110-46bf-ccbb-2613-29a5df296461/displayicon.png' }
  );

  console.log('✅ Prime Phantom image URL fixed!');
  await connection.close();
  process.exit(0);
}

fixPrimePhantom().catch(err => { console.error(err); process.exit(1); });
