import { createConnection } from 'typeorm';
import { Auction } from './auctions/auction.entity';
import { Bid } from './bids/bid.entity';
import { User } from './users/user.entity';

async function fixRoles() {
  const connection = await createConnection({
    type: 'postgres', host: 'localhost', port: 5432,
    username: 'auction_user', password: 'secretpassword', database: 'auction_db',
    entities: [User, Auction, Bid],
  });

  const usersRepo = connection.getRepository(User);
  const allUsers = await usersRepo.find({ select: ['id', 'email', 'name', 'role'] });

  console.log('Current users:');
  allUsers.forEach(u => console.log(`  [${u.role}] ${u.email} (${u.name || 'no name'})`));

  // Force all users whose email is NOT admin00 to have role 'user'
  let fixed = 0;
  for (const u of allUsers) {
    const isAdmin = u.email === 'admin00' || u.name === 'admin00' || u.email?.includes('admin00');
    if (!isAdmin && u.role === 'admin') {
      await usersRepo.update(u.id, { role: 'user' });
      console.log(`✅ Fixed role for ${u.email}: admin → user`);
      fixed++;
    }
  }

  // Make sure admin00 has admin role
  const admin = allUsers.find(u => u.email === 'admin00' || u.name === 'admin00' || u.email?.includes('admin00'));
  if (admin && admin.role !== 'admin') {
    await usersRepo.update(admin.id, { role: 'admin' });
    console.log(`✅ Ensured admin00 has admin role`);
  }

  if (fixed === 0) console.log('No roles needed fixing (or issue is elsewhere — check registration)');
  
  console.log('\nUsers after fix:');
  const updated = await usersRepo.find({ select: ['id', 'email', 'name', 'role'] });
  updated.forEach(u => console.log(`  [${u.role}] ${u.email} (${u.name || 'no name'})`));

  await connection.close();
  process.exit(0);
}

fixRoles().catch(err => { console.error(err); process.exit(1); });
