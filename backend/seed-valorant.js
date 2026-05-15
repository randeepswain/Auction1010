const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'auction_user',
  password: 'secretpassword',
  database: 'auction_db',
});

const skins = [
  { title: 'Kuronami Vandal', starting_bid: 50, duration: 60, image: '/uploads/kuronami.jpg' },
  { title: 'Prime Vandal', starting_bid: 35, duration: 60, image: '/uploads/prime.jpg' },
  { title: 'Araxys Vandal', starting_bid: 45, duration: 60, image: '/uploads/araxys.jpg' },
  { title: 'RGX 11z Pro Phantom', starting_bid: 40, duration: 60, image: '/uploads/rgx.jpg' },
  { title: 'Spectrum Classic', starting_bid: 30, duration: 60, image: '/uploads/spectrum.jpg' },
  { title: 'Elderflame Vandal', starting_bid: 60, duration: 60, image: '/uploads/elderflame.jpg' },
  { title: 'Reaver Operator', starting_bid: 45, duration: 60, image: '/uploads/reaver_op.jpg' },
  { title: 'Glitchpop Dagger', starting_bid: 55, duration: 60, image: '/uploads/glitchpop.jpg' },
  { title: 'Ion Sheriff', starting_bid: 25, duration: 60, image: '/uploads/ion.jpg' },
  { title: 'Magepunk Ghost', starting_bid: 20, duration: 60, image: '/uploads/magepunk.jpg' },
];

async function seed() {
  await client.connect();
  console.log('Connected to DB');

  for (const skin of skins) {
    const res = await client.query(
      `INSERT INTO auctions (title, starting_bid, current_highest_bid, duration_minutes, max_users, status, image_url, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`,
      [skin.title, skin.starting_bid, skin.starting_bid, skin.duration, 100, 'upcoming', skin.image]
    );
    console.log(`Inserted ${skin.title} with ID: ${res.rows[0].id}`);
  }

  await client.end();
  console.log('Seed complete');
}

seed().catch(console.error);
