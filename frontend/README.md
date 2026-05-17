# 💻 Next.js 16 Client — Valorant Auction Platform

A premium, interactive web interface built with **Next.js 16**, **React 19**, and **Tailwind CSS v4** to deliver an immersive Valorant-themed auctioning experience.

---

## ✨ Features

- **App Router Architecture**: Leverage Next.js App Router for server-rendered structures combined with highly interactive client components.
- **Tailwind CSS v4 Styling**: Custom modern layout utilizing HSL-tailored colors, smooth glassmorphism, responsive grids, and sleek CSS transitions/micro-animations.
- **Real-Time Synchronicity**: Subscribes dynamically to bid states via `socket.io-client` with instant reactive UI updates when high bids change.
- **Custom Agent Selections**: Full User Profile portal supporting avatar updates and interactive Valorant Agent backgrounds.
- **Admin Command Suite**: Exclusive dashboard view dedicated to managing auction item configurations and registration controls.

---

## 🛠️ Technology Stack

- **Framework**: Next.js `16.2.6` (App Router)
- **Runtime Library**: React `19.2.4` + React-DOM `19.2.4`
- **Styling**: Tailwind CSS `^4.0` (utilizing `@tailwindcss/postcss`)
- **Icons**: Lucide React `^1.16.0`
- **Real-time Engine**: Socket.io Client `^4.8.3`

---

## 📂 Project Architecture

```
frontend/
├── public/                  # Static assets (Agent backgrounds, logs, UI icons)
├── src/
│   ├── app/                 # Next.js App Router Pages
│   │   ├── admin/           # Admin verification suite
│   │   ├── auctions/[id]/   # High-fidelity live bidding room
│   │   ├── dashboard/       # Main auction grid (live and upcoming)
│   │   ├── login/           # Sleek dark-mode credentials layout
│   │   ├── profile/         # User statistics & Agent customize hub
│   │   ├── globals.css      # Core theme tokens, utility animations, & fonts
│   │   ├── layout.tsx       # Root wrapper & Auth provider injection
│   │   └── page.tsx         # Welcome / Landing navigation portal
│   ├── context/             # Global Context providers (Auth session management)
│   ├── hooks/               # Custom reusable React hooks (Socket subscriptions)
│   └── utils/               # Axios/Fetch API endpoint abstractors
├── eslint.config.mjs        # ESLint flat configuration for TypeScript
├── next.config.ts           # Remote image routing protocols & Next config
└── postcss.config.mjs       # Tailwind PostCSS configuration
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
Ensure you have Node.js version `20` or higher installed.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure the API and Socket connections point to your local NestJS backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Boot Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.

---

## 🧹 Code Quality & Build Commands

- **Code Formatting/Linting**:
  ```bash
  npm run lint
  ```
- **Production Build (Local Dry-run)**:
  ```bash
  npm run build
  ```
- **Production Start**:
  ```bash
  npm run start
  ```

---

## ⚡ Deployment configuration

This client is pre-engineered for optimal deployment on **Netlify** or **Vercel** via serverless edge layers.

### Netlify Settings (`netlify.toml` at Root)
```toml
[build]
  base = "frontend"
  command = "npm install && npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```
Ensure all environment variables beginning with `NEXT_PUBLIC_` are set directly inside the host deployment control panel.
