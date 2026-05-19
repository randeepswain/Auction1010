# 🎮 Valorant Auction Platform

A premium, full-stack, real-time auction platform tailored for Valorant weapon skins. Designed for high performance, absolute data integrity, and cutting-edge aesthetics.

This ecosystem is composed of a **Next.js 16 + React 19** frontend, a **NestJS 11** high-concurrency API server backed by **PostgreSQL** and **Redis Redlock**, and a **FastAPI** microservice executing real-time AI-driven pricing and fraud evaluations.

---

## 🏗️ System Architecture

Our services are partitioned into specialized microservices to optimize scale, maintainability, and resource utilization:


### 💻 Frontend Client
- **Framework**: [Next.js 16.2](https://nextjs.org/) (App Router, React 19.2)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS
- **Real-Time Synchronicity**: `socket.io-client` subscribing to bid rooms
- **Host Compatibility**: Netlify, Vercel, static/dynamic serverless edge deployment

### 🚀 Backend API Server
- **Framework**: [NestJS 11](https://nestjs.com/) (TypeScript)
- **Database Mapping**: [TypeORM 0.3](https://typeorm.io/) with a PostgreSQL driver
- **Concurrency Guard**: Redis distributed lock integration via `ioredis` and `redlock` to ensure zero race conditions or double-bids on the same auction item.
- **WebSockets**: Native `@nestjs/platform-socket.io` handling real-time WebSocket state distribution.

### 🤖 AI Service
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Security Logic**: Multi-factor real-time fraud scoring (evaluating bid velocity, proxy self-bidding, rapid retraction patterns) via `/api/v1/fraud/evaluate`.
- **Valuation Logic**: Dynamic smart suggestion algorithms to calculate optimal reserve and starting bid bounds.

---

## 🚀 Quick Start (Docker Orchestration)

The quickest way to spin up the entire ecosystem (including PostgreSQL, Redis, MongoDB, and all services) is utilizing `docker-compose`.

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and verify Docker Compose is available (`docker compose version`).

### Spin Up Services
Run the following command from the repository root:
```bash
docker-compose up --build
```

This starts the following mapped port network locally:
- **Frontend Client**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:3001](http://localhost:3001)
- **AI Microservice**: [http://localhost:8000](http://localhost:8000)
- **PostgreSQL Database**: Port `5432`
- **Redis Cache/Lock Manager**: Port `6379`
- **MongoDB Database**: Port `27017`

---

## 🛠️ Local Development (Service-by-Service)

If you prefer to run services manually for debugging or active development:

### 1. Database & Cache Services
Spin up only the database and cache dependencies through Docker:
```bash
docker-compose up postgres redis mongo -d
```

### 2. Backend Setup
1. Navigate to `backend/` and copy environment template:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Install NestJS dependencies:
   ```bash
   npm install
   ```
3. Run migrations and database seeder:
   ```bash
   # Seed Valorant auction items
   npm run seed
   
   # Add admin users/roles
   npm run seed-admin
   ```
4. Start the NestJS server in watch mode:
   ```bash
   npm run start:dev
   ```

### 3. Frontend Setup
1. Navigate to `frontend/` and copy environment template:
   ```bash
   cd ../frontend
   cp .env.example .env
   ```
2. Install Next.js dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```

### 4. AI Python Service Setup
1. Navigate to `ai-service/`:
   ```bash
   cd ../ai-service
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install microservice requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Spin up the service:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

---

## ⚙️ Shared Environment Variables Reference

### Backend (`/backend/.env`)
| Key | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | Server port |
| `POSTGRES_HOST` | `localhost` | Database host |
| `POSTGRES_USER` | `auction_user` | DB username |
| `POSTGRES_PASSWORD` | `secretpassword` | DB password |
| `POSTGRES_DB` | `auction_db` | DB database name |
| `REDIS_HOST` | `localhost` | Redis host |
| `MONGO_URI` | `mongodb://localhost:27017/iob_db` | MongoDB logger connection string |
| `JWT_SECRET` | `your-super-secret-key-change-in-prod` | Signing secret for JSON Web Tokens |

### Frontend (`/frontend/.env`)
| Key | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | NestJS base HTTP route |
| `NEXT_PUBLIC_WS_URL` | `http://localhost:3001` | WebSockets Socket.io origin |

---

## 🛡️ Production & Deployment Best Practices

### Backend Host (e.g., Render, AWS EC2, railway)
- Configure strict CORS configurations limiting WebSocket/HTTP origins solely to the frontend production domain.
- Ensure Redis is properly firewalled; only accept connections from backend microservices.

### Frontend Host (e.g., Netlify)
- Leverage the [Netlify Next.js Runtime](https://docs.netlify.com/integrations/frameworks/next-js/) configured automatically via [netlify.toml](file:///c:/Users/rande/Downloads/auction/netlify.toml).
- Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` inside the host UI configuration panels rather than hardcoding in environment files.

---

## 📄 License
This repository is licensed under the **MIT License**.
