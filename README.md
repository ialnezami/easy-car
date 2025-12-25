# Easy Car - Multi-Tenant Car Rental Platform

A modern car rental platform built with Next.js, MongoDB, and Vercel. Each car rental agency has its own dedicated page with full management capabilities.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

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

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your MongoDB URI and NextAuth secret:
- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Generate a secret key (you can use `openssl rand -base64 32`)

4. Create initial admin user and agency:
```bash
npx tsx scripts/create-admin.ts [agency-slug] [agency-name] [email] [password] [name]
```

Example:
```bash
npx tsx scripts/create-admin.ts agence1 "Agency 1" admin@agence1.com admin123 "Admin User"
```

5. Run the development server:
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

## Environment Variables

See `.env.local.example` for required environment variables.

## Deployment

Deploy to Vercel:

```bash
vercel
```

Make sure to configure environment variables in Vercel dashboard.

## License

MIT

