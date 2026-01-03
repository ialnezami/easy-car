# Testing Guide

This guide covers how to test the Easy Car application with Docker MongoDB.

## Quick Start with Docker

The easiest way to test the application is using the automated setup script:

```bash
./scripts/quick-start-docker.sh
```

This script will:
1. ✅ Check Docker is running
2. ✅ Create `.env.local` from Docker template
3. ✅ Start MongoDB containers
4. ✅ Install dependencies (if needed)
5. ✅ Set up database indexes
6. ✅ Create admin user (interactive)

## Manual Testing Steps

### 1. Start MongoDB

```bash
docker-compose up -d
```

Verify containers are running:
```bash
docker-compose ps
```

### 2. Configure Environment

```bash
cp .env.docker.example .env.local
```

Generate NextAuth secret:
```bash
openssl rand -base64 32
```

Update `.env.local` with the generated secret.

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Database

```bash
# Create indexes
npm run setup-indexes

# Create admin user
npx tsx scripts/create-admin.ts agence1 "Agency 1" admin@agence1.com admin123 "Admin User"
```

### 5. Start Application

```bash
npm run dev
```

### 6. Test the Application

1. **Home Page**: http://localhost:3000
   - Should show agency selection page

2. **Agency Page**: http://localhost:3000/agence1
   - Should show vehicles (if any added)

3. **Admin Dashboard**: http://localhost:3000/dashboard
   - Sign in with: `admin@agence1.com` / `admin123`
   - Add vehicles, manage pricing, view reservations

4. **Client Registration**: http://localhost:3000/auth/register
   - Create a client account
   - Sign in and make reservations

5. **Mongo Express**: http://localhost:8081
   - Username: `admin`
   - Password: `admin123`
   - Browse database collections

## Testing Scenarios

### Scenario 1: Agency Manager Workflow

1. Sign in as agency manager
2. Add a new vehicle with pricing
3. Create a discount code
4. View reservations dashboard

### Scenario 2: Client Booking Workflow

1. Register as a client
2. Browse agency vehicles
3. Select a vehicle and dates
4. Apply discount code (if available)
5. Complete reservation
6. View booking in client dashboard

### Scenario 3: Reservation Management

1. As agency manager, view pending reservations
2. Confirm a reservation
3. As client, verify reservation status changed to "confirmed"

### Scenario 4: Availability Checking

1. Book a vehicle for specific dates
2. Try to book the same vehicle for overlapping dates
3. Verify error message about unavailability

## Database Verification

### Check Collections

```bash
docker exec -it easy-car-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

In MongoDB shell:
```javascript
use easy-car
db.getCollectionNames()

// Check agencies
db.agencies.find().pretty()

// Check vehicles
db.vehicles.find().pretty()

// Check reservations
db.reservations.find().pretty()

// Check users
db.users.find().pretty()
```

### Verify Indexes

```javascript
// Check indexes on a collection
db.vehicles.getIndexes()
db.reservations.getIndexes()
```

## Troubleshooting

### MongoDB Not Starting

```bash
# Check logs
docker-compose logs mongodb

# Restart containers
docker-compose restart

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Connection Issues

1. Verify MongoDB is running: `docker-compose ps`
2. Check connection string in `.env.local`
3. Test connection:
   ```bash
   docker exec easy-car-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.runCommand('ping')"
   ```

### Application Errors

1. Check application logs in terminal
2. Verify environment variables are set correctly
3. Ensure database indexes are created: `npm run setup-indexes`
4. Check MongoDB logs: `docker-compose logs mongodb`

## Clean Slate Testing

To start fresh:

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Remove node_modules (optional)
rm -rf node_modules

# Start fresh
./scripts/quick-start-docker.sh
```

## Performance Testing

### Load Test Database

```bash
# Insert test data
docker exec -it easy-car-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# In MongoDB shell:
use easy-car

// Create test agencies
for (let i = 1; i <= 10; i++) {
  db.agencies.insertOne({
    name: `Agency ${i}`,
    slug: `agency${i}`,
    email: `agency${i}@test.com`,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// Create test vehicles
db.agencies.find().forEach(function(agency) {
  for (let i = 1; i <= 5; i++) {
    db.vehicles.insertOne({
      agencyId: agency._id,
      make: "Toyota",
      model: `Model ${i}`,
      year: 2020 + i,
      color: "White",
      licensePlate: `ABC${i}${agency.slug}`,
      images: [],
      features: [],
      seats: 5,
      transmission: "automatic",
      fuelType: "gasoline",
      pricing: { daily: 50, weekly: 300, monthly: 1200 },
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
});
```

## API Testing

### Test API Endpoints

```bash
# Get agencies
curl http://localhost:3000/api/agencies

# Get vehicles
curl http://localhost:3000/api/vehicles?agencyId=<agency-id>

# Create reservation (requires auth token)
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "<vehicle-id>",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "1234567890",
    "startDate": "2024-01-01",
    "endDate": "2024-01-05"
  }'
```

## Next Steps

After successful testing:

1. ✅ Verify all features work as expected
2. ✅ Test error handling
3. ✅ Verify data persistence
4. ✅ Test multi-tenant isolation
5. ✅ Performance test with larger datasets

For production deployment, use MongoDB Atlas or a managed MongoDB service.


