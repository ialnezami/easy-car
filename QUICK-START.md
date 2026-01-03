# Quick Start Guide - Testing with Docker

## ⚠️ Prerequisites

**IMPORTANT**: Docker Desktop must be running before proceeding!

1. **Start Docker Desktop** on your Mac
2. Wait for Docker to fully start (whale icon in menu bar should be steady)
3. Verify Docker is running:
   ```bash
   docker info
   ```

## 🚀 Step-by-Step Testing

### Step 1: Start MongoDB with Docker

```bash
cd /Users/ibrahimalnezami/Desktop/easy-car
docker-compose up -d
```

Wait for MongoDB to be ready (about 10-15 seconds):
```bash
docker-compose ps
```

You should see both `easy-car-mongodb` and `easy-car-mongo-express` as "Up".

### Step 2: Verify MongoDB is Running

```bash
docker exec easy-car-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.runCommand('ping')"
```

Should return: `{ ok: 1 }`

### Step 3: Set Up Database Indexes

```bash
npm run setup-indexes
```

### Step 4: Create Admin User

```bash
npx tsx scripts/create-admin.ts agence1 "Agency 1" admin@agence1.com admin123 "Admin User"
```

### Step 5: Start the Application

```bash
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

### Step 6: Test in Browser

Open your browser and navigate to:
- **Home**: http://localhost:3000
- **Agency Page**: http://localhost:3000/agence1
- **Admin Dashboard**: http://localhost:3000/dashboard
- **Mongo Express**: http://localhost:8081

## 🧪 Testing Checklist

### ✅ Basic Functionality

- [ ] Home page loads and shows agency selection
- [ ] Can navigate to agency page (`/agence1`)
- [ ] Can sign in as admin (`admin@agence1.com` / `admin123`)
- [ ] Can access dashboard
- [ ] Can add a vehicle
- [ ] Can create a discount code
- [ ] Can view reservations

### ✅ Client Features

- [ ] Can register as a client (`/auth/register`)
- [ ] Can sign in as client
- [ ] Can browse vehicles on agency page
- [ ] Can view vehicle details
- [ ] Can make a reservation (requires sign in)
- [ ] Can view bookings in client dashboard

### ✅ Reservation Flow

- [ ] Reservation starts as "pending"
- [ ] Agency manager can see pending reservations
- [ ] Agency manager can confirm reservation
- [ ] Client sees status change to "confirmed"

## 🛑 Stopping Everything

```bash
# Stop the Next.js dev server: Press Ctrl+C in terminal

# Stop Docker containers
docker-compose down

# Or stop and remove data
docker-compose down -v
```

## 🐛 Troubleshooting

### Docker Not Starting
- Make sure Docker Desktop is running
- Check: `docker info` should work
- Restart Docker Desktop if needed

### MongoDB Connection Error
- Verify containers are running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`
- Restart containers: `docker-compose restart`

### Port 3000 Already in Use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Application Errors
- Check `.env.local` exists and has correct `MONGODB_URI`
- Verify indexes are created: `npm run setup-indexes`
- Check admin user exists in database

## 📊 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Application | http://localhost:3000 | - |
| Admin Dashboard | http://localhost:3000/dashboard | admin@agence1.com / admin123 |
| Mongo Express | http://localhost:8081 | admin / admin123 |
| MongoDB | localhost:27017 | admin / admin123 |

## 🎯 Next Steps After Testing

1. Test all features thoroughly
2. Try creating multiple agencies
3. Test multi-tenant isolation
4. Test availability checking
5. Test discount application
6. Verify data persistence after restart


