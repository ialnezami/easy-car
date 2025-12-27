# Easy Car - Multi-Tenant Car Rental Platform

A modern car rental platform built with Next.js, MongoDB, and Vercel. Each car rental agency has its own dedicated page with full management capabilities.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🚀 Quick Start with Docker

**Before starting, make sure Docker Desktop is running!**

```bash
# Automated setup (recommended)
./scripts/check-and-start.sh

# Or manual setup:
docker-compose up -d
cp .env.docker.example .env.local  # or use existing .env.local
npm install
npm run setup-indexes
npx tsx scripts/create-admin.ts agence1 "Agency 1" admin@agence1.com admin123 "Admin User"
npm run dev
```

See [QUICK-START.md](./QUICK-START.md) for detailed testing guide.

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account, local MongoDB instance, or Docker (recommended for testing)
- npm or yarn
- Docker Desktop (optional, for local MongoDB)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd easy-car
```

2. Install dependencies:
```bash
npm install
```

3. Set up MongoDB:

**Option A: Using Docker (Recommended for Testing)**
```bash
# Quick start (automated setup)
./scripts/quick-start-docker.sh

# Or manual setup:
# Start MongoDB with Docker Compose
docker-compose up -d

# Copy Docker environment file
cp .env.docker.example .env.local
```

**Option B: Using MongoDB Atlas**
```bash
# Copy standard environment file
cp .env.local.example .env.local
```

**Option C: Using Local MongoDB**
```bash
# Copy standard environment file
cp .env.local.example .env.local
# Update MONGODB_URI to: mongodb://localhost:27017/easy-car
```

Edit `.env.local` with your configuration:
- `MONGODB_URI`: Your MongoDB connection string
  - Docker: `mongodb://admin:admin123@localhost:27017/easy-car?authSource=admin`
  - Atlas: Your Atlas connection string
  - Local: `mongodb://localhost:27017/easy-car`
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Generate a secret key (you can use `openssl rand -base64 32`)

> 💡 **Tip**: See [DOCKER.md](./DOCKER.md) for detailed Docker setup instructions.

4. Create initial admin user and agency:
```bash
npx tsx scripts/create-admin.ts [agency-slug] [agency-name] [email] [password] [name]
```

Example:
```bash
npx tsx scripts/create-admin.ts agence1 "Agency 1" admin@agence1.com admin123 "Admin User"
```

5. Set up database indexes (recommended for performance):
```bash
npm run setup-indexes
```
Or call the API endpoint: `GET /api/setup`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Credentials

After running the create-admin script, you can sign in with:
- Email: `admin@agence1.com` (or the email you provided)
- Password: `admin123` (or the password you provided)

## Project Structure

```
easy-car/
├── app/                    # Next.js app directory
│   ├── [agency-slug]/     # Multi-tenant agency pages
│   ├── api/               # API routes
│   ├── dashboard/         # Agency management dashboard
│   └── auth/              # Authentication pages
├── components/            # Reusable React components
├── lib/                   # Utilities and helpers
│   ├── db/               # Database connection and models
│   └── utils/            # Utility functions
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Features

- Multi-tenant architecture with dedicated agency pages
- Agency management dashboard
- Vehicle management (CRUD operations)
- Dynamic pricing (daily, weekly, monthly)
- Discount management
- Reservation system
- Availability checking
- Responsive design

## Docker Commands

When using Docker for MongoDB:

```bash
# Start MongoDB
npm run docker:up

# Stop MongoDB
npm run docker:down

# View logs
npm run docker:logs

# Test Docker setup
npm run docker:test
```

## Environment Variables

See `.env.local.example` or `.env.docker.example` for required environment variables.

## Deployment

Deploy to Vercel:

```bash
vercel
```

Make sure to configure environment variables in Vercel dashboard.

## License

MIT

