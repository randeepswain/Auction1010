import { createConnection } from 'typeorm';
import { Auction } from './auctions/auction.entity';
import { Bid } from './bids/bid.entity';
import { User } from './users/user.entity';
import Redis from 'ioredis';

// Verified URLs — INR prices based on real Valorant VP costs in India
const VALORANT_SKINS = [
  { title: 'Reaver Vandal',                image_url: 'https://media.valorant-api.com/weaponskins/30388628-42f0-606c-82c0-73ad43de997f/displayicon.png', starting_bid: 1275 },
  { title: 'Prime//2.0 Phantom',           image_url: 'https://media.valorant-api.com/weaponskins/44b7b110-46bf-ccbb-2613-29a5df296461/displayicon.png', starting_bid: 1275 },
  { title: 'Elderflame Vandal',            image_url: 'https://media.valorant-api.com/weaponskins/18609205-4edb-5966-cff8-0fba0230ba1e/displayicon.png', starting_bid: 2550 },
  { title: 'Glitchpop Frenzy',            image_url: 'https://media.valorant-api.com/weaponskins/5596d764-4b62-210b-59db-7982e9d4c23f/displayicon.png', starting_bid: 1920 },
  { title: 'Sentinels of Light Operator', image_url: 'https://media.valorant-api.com/weaponskins/b05c4c98-4108-e442-add7-da99a95a37b6/displayicon.png', starting_bid: 3125 },
  { title: 'RGX 11z Pro Phantom',         image_url: 'https://media.valorant-api.com/weaponskins/499acf05-4f79-e345-3714-57bf7aa163ea/displayicon.png', starting_bid: 1560 },
  { title: 'Champions 2021 Vandal',       image_url: 'https://media.valorant-api.com/weaponskins/9bf19b77-4b33-7203-9f2c-16932970622f/displayicon.png', starting_bid: 1920 },
  { title: 'Ion Sheriff',                 image_url: 'https://media.valorant-api.com/weaponskins/83778c03-45a3-67a2-3c89-6b8598327d58/displayicon.png', starting_bid: 1560 },
  { title: 'Kuronami Phantom',            image_url: 'https://media.valorant-api.com/weaponskins/3f6410af-4fd7-74fb-c0f4-6ab61d30022c/displayicon.png', starting_bid: 1275 },
  { title: 'Evori Dreamwings Spectre',   image_url: 'https://media.valorant-api.com/weaponskins/fb3f3ffd-46bc-41e3-25c9-2688f2d017ed/displayicon.png', starting_bid: 1275 },
];

async function resetAndSeed() {
  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'auction_user',
    password: 'secretpassword',
    database: 'auction_db',
    entities: [User, Auction, Bid],
  });

  const redis = new Redis({ host: 'localhost', port: 6379 });

  console.log('Clearing database and Redis...');
  const bidsRepo = connection.getRepository(Bid);
  const auctionsRepo = connection.getRepository(Auction);

  const allBids = await bidsRepo.find();
  if (allBids.length > 0) await bidsRepo.remove(allBids);
  console.log('Bids cleared.');

  const allAuctions = await auctionsRepo.find();
  if (allAuctions.length > 0) await auctionsRepo.remove(allAuctions);
  console.log('Auctions cleared.');

  await redis.flushall();
  console.log('Redis flushed.\n');

  for (let i = 0; i < VALORANT_SKINS.length; i++) {
    const skin = VALORANT_SKINS[i];
    const status = i < 4 ? 'active' : 'upcoming';
    const auction = auctionsRepo.create({
      title: skin.title,
      starting_bid: skin.starting_bid,
      current_highest_bid: skin.starting_bid,
      start_time: new Date(),
      end_time: new Date(Date.now() + 1000 * 60 * 60),
      duration_minutes: 60,
      max_users: 100,
      status,
      image_url: skin.image_url
    });
    const saved = await auctionsRepo.save(auction);
    if (status === 'active') {
      await redis.hset(`auction:${saved.id}`, { highest_bid: skin.starting_bid, highest_bidder_id: '' });
    }
    console.log(`✅ [${status}] ${skin.title}`);
  }

  console.log('\n🎯 Database seeded with 10 Valorant Gun Skins!');
  await redis.quit();
  await connection.close();
  process.exit(0);
}

resetAndSeed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
