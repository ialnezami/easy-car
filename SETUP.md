# Easy Car - Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.local.example` to `.env.local`
   - Add your MongoDB connection string
   - Generate a NextAuth secret: `openssl rand -base64 32`

3. **Create Admin User**
   ```bash
   npx tsx scripts/create-admin.ts agence1 "Agency 1" admin@agence1.com admin123 "Admin User"
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Home: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard
   - Agency Page: http://localhost:3000/agence1

## Project Structure

```
easy-car/
├── app/                      # Next.js App Router
│   ├── [agency-slug]/       # Multi-tenant agency pages
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Agency management dashboard
│   └── page.tsx             # Home page
├── components/              # React components
├── lib/                     # Utilities and helpers
│   ├── auth/               # Authentication config
│   ├── db/                 # Database models and connection
│   └── utils/              # Utility functions
├── scripts/                # Utility scripts
└── types/                  # TypeScript type definitions
```

## Features Implemented

### ✅ Phase 1: Project Setup
- Next.js 14 with TypeScript
- Tailwind CSS configuration
- ESLint and Prettier
- MongoDB connection setup
- Database models (Agencies, Vehicles, Reservations, Discounts, Users)

### ✅ Phase 2: Core Infrastructure
- NextAuth.js authentication
- Multi-tenant routing (`/[agency-slug]`)
- Protected dashboard routes
- API routes for all entities

### ✅ Phase 3: Agency Management Dashboard
- Dashboard layout with navigation
- Vehicle management (CRUD)
- Pricing and discount management
- Reservation viewing

### ✅ Phase 4: Public-Facing Pages
- Agency public pages
- Vehicle listing and detail pages
- Reservation form with pricing calculator
- Reservation confirmation page

### ✅ Phase 5: Business Logic
- Pricing calculation engine
- Vehicle availability checking
- Discount application logic
- Date conflict detection

## API Endpoints

### Agencies
- `GET /api/agencies` - List all agencies
- `GET /api/agencies/[slug]` - Get agency by slug
- `POST /api/agencies` - Create agency

### Vehicles
- `GET /api/vehicles?agencyId=...` - List vehicles
- `GET /api/vehicles/[id]` - Get vehicle
- `POST /api/vehicles` - Create vehicle (auth required)
- `PUT /api/vehicles/[id]` - Update vehicle (auth required)
- `DELETE /api/vehicles/[id]` - Delete vehicle (auth required)
- `GET /api/vehicles/[id]/pricing` - Calculate pricing

### Reservations
- `GET /api/reservations?agencyId=...&vehicleId=...` - List reservations
- `POST /api/reservations` - Create reservation

### Discounts
- `GET /api/discounts?agencyId=...&code=...` - List discounts
- `POST /api/discounts` - Create discount (auth required)

### Authentication
- `POST /api/auth/signout` - Sign out

## Database Collections

- **agencies**: Agency information
- **vehicles**: Vehicle details and pricing
- **reservations**: Booking information
- **discounts**: Promotional codes and discounts
- **users**: Agency managers/admins

## Next Steps

1. **Add Payment Integration** (Stripe, PayPal, etc.)
2. **Email Notifications** (Reservation confirmations)
3. **Image Upload** (Currently uses URLs, add file upload)
4. **Search & Filtering** (Enhanced vehicle search)
5. **Analytics Dashboard** (Booking statistics)
6. **Customer Accounts** (User registration)
7. **Reviews & Ratings** (Customer feedback)

## Troubleshooting

### MongoDB Connection Issues
- Verify your `MONGODB_URI` in `.env.local`
- Check MongoDB Atlas IP whitelist
- Ensure database user has proper permissions

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- Clear browser cookies if session issues persist

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)
- Clear `.next` folder and rebuild

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `MONGODB_URI`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
4. Deploy!

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production
```

## Support

For issues or questions, please check the project documentation or create an issue in the repository.

