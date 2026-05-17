# 🚀 NestJS 11 Gateway API — Valorant Auction Platform

A production-grade, highly-concurrent NestJS API server designed to handle real-time Valorant skin auctions. It integrates robust WebSocket connections for bid synchronicity and Redis-based distributed locking to guarantee database integrity under heavy loads.

---

## ⚡ Core Capabilities

- **High-Concurrency Bid Locking (Redlock)**: Placements of competitive bids are wrapped in distributed Redis locks. This prevents bid race conditions, double-debits, or timing attacks on hot items.
- **Real-Time Broadcasts**: WebSockets via `Socket.io` instantly push up-to-date bid statuses, transaction events, and active auction tallies to all connected client browsers.
- **Secured Authentication**: Robust identity assurance built on JWT-signed tokens and secure custom Guard filters (Admin and User role scopes).
- **Dual database architecture**: Structured operational states reside in **PostgreSQL** (TypeORM), while audit logs and transient event trails are channeled to **MongoDB**.

---

## 🛠️ Technology Stack

- **Framework**: NestJS `^11.0.1` (TypeScript)
- **Object Relational Mapper**: TypeORM `^0.3.29`
- **Data Stores**: PostgreSQL (`pg ^8.20`), Redis (`ioredis ^5.10`), MongoDB
- **Distributed Lock**: Redlock `^5.0.0-beta.2`
- **Real-time Gateway**: `@nestjs/platform-socket.io` (Socket.io `^4.8.3`)
- **Authentication**: Passport JWT (`@nestjs/jwt ^11.0.2`, `@nestjs/passport ^11.0.5`)
- **Validators**: `class-validator` & `class-transformer`

---

## 📂 Source Code Structure

```
backend/
├── src/
│   ├── auctions/          # Auction item modules, services, & REST routes
│   ├── auth/              # JWT strategy, password encryptions, & role guards
│   ├── bids/              # Bidding logic, transaction, & Redlock orchestration
│   ├── events/            # WebSockets Gateway handling real-time push events
│   ├── users/             # User profiles, statistics, & verification states
│   ├── app.module.ts      # Core parent Nest module loading config systems
│   ├── approve-users.ts   # Helper CLI script to toggle user approvals
│   ├── fix-image.ts       # Database repair utility script for skin assets
│   ├── fix-roles.ts       # Database repair utility script for user admin privileges
│   ├── main.ts            # Entrypoint bootstrap initializing Nest application
│   ├── reset.ts           # Clean & drop operational DB collections
│   └── seed-admin.ts      # CLI seed runner generating admin credential systems
├── test/                  # Automated integration & End-to-End Jest tests
├── eslint.config.mjs      # Linter configurations
├── nest-cli.json          # Nest build & path configurations
└── tsconfig.json          # TS compiler specifications
```

---

## 🚀 Getting Started

### 1. Prerequisite Installations
- Node.js (v20 or v22)
- Running local instances of PostgreSQL, Redis, and MongoDB (or through root Docker Compose setup).

### 2. Set Up Environment Config
Copy the example environment:
```bash
cp .env.example .env
```
Update configuration parameters in `.env` to line up with your active databases:
```env
PORT=3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=auction_user
POSTGRES_PASSWORD=secretpassword
POSTGRES_DB=auction_db

REDIS_HOST=localhost
REDIS_PORT=6379

MONGO_URI=mongodb://localhost:27017/iob_db
JWT_SECRET=your-super-secret-key-change-in-prod
```

### 3. Install NPM Modules
```bash
npm install
```

### 4. Database Setup & Seeding
Reset databases and bootstrap initial Valorant skins:
```bash
# Seed standard skins and upcoming auctions
npm run seed

# Seed default admin user credentials (admin00/secretpassword)
npm run seed-admin
```

### 5. Launch the Server
```bash
# Development (with active file watch reloading)
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

---

## 🛡️ Concurrency Guard Implementation Details

When multiple players place a bid in the same millisecond, the bidding controller requests a distributed lock on the auction entity's key using Redis Redlock:

```typescript
const lockKey = `locks:auction:${auctionId}`;
const lock = await redlock.acquire([lockKey], 1000); // 1-second lock lease

try {
  // 1. Fetch current auction price inside isolation block
  // 2. Validate that the new bid is higher than current maximum
  // 3. Save new bid & update auction high-bid details
  // 4. Dispatch WebSocket refresh broadcast
} finally {
  await lock.release();
}
```

This guarantees flawless auction logic that is 100% immune to distributed double-spending or race conditions.
