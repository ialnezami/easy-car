# Docker Setup Guide

This guide explains how to run MongoDB using Docker for local development and testing.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

## Quick Start

### 1. Start MongoDB with Docker Compose

```bash
docker-compose up -d
```

This will start:
- **MongoDB** on port `27017`
- **Mongo Express** (Web UI) on port `8081`

### 2. Configure Environment Variables

Copy the Docker-specific environment file:

```bash
cp .env.docker.example .env.local
```

Or manually set in `.env.local`:
```env
MONGODB_URI=mongodb://admin:admin123@localhost:27017/easy-car?authSource=admin
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Database Indexes

```bash
npm run setup-indexes
```

### 5. Create Admin User

```bash
npx tsx scripts/create-admin.ts agence1 "Agency 1" admin@agence1.com admin123 "Admin User"
```

### 6. Start the Application

```bash
npm run dev
```

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ This deletes all data)
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# MongoDB only
docker-compose logs -f mongodb

# Mongo Express only
docker-compose logs -f mongo-express
```

### Check Service Status
```bash
docker-compose ps
```

### Restart Services
```bash
docker-compose restart
```

## Accessing MongoDB

### Connection String
```
mongodb://admin:admin123@localhost:27017/easy-car?authSource=admin
```

### Mongo Express (Web UI)
Open your browser and navigate to:
```
http://localhost:8081
```

**Login credentials:**
- Username: `admin`
- Password: `admin123`

### MongoDB Shell (mongosh)
```bash
docker exec -it easy-car-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

## Database Management

### Backup Database
```bash
docker exec easy-car-mongodb mongodump --uri="mongodb://admin:admin123@localhost:27017/easy-car?authSource=admin" --out=/data/backup
docker cp easy-car-mongodb:/data/backup ./backup
```

### Restore Database
```bash
docker cp ./backup easy-car-mongodb:/data/backup
docker exec easy-car-mongodb mongorestore --uri="mongodb://admin:admin123@localhost:27017/easy-car?authSource=admin" /data/backup/easy-car
```

### View Database Collections
```bash
docker exec -it easy-car-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "use easy-car; db.getCollectionNames()"
```

## Troubleshooting

### Port Already in Use
If port 27017 is already in use:
1. Stop any local MongoDB instances
2. Or change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "27018:27017"  # Use 27018 instead
   ```
   Then update `.env.local`:
   ```env
   MONGODB_URI=mongodb://admin:admin123@localhost:27018/easy-car?authSource=admin
   ```

### Container Won't Start
```bash
# Check logs
docker-compose logs mongodb

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Connection Refused
1. Ensure Docker Desktop is running
2. Check if containers are up: `docker-compose ps`
3. Check MongoDB health: `docker-compose logs mongodb`

### Reset Everything
```bash
# Stop and remove containers and volumes
docker-compose down -v

# Remove images (optional)
docker rmi mongo:7.0 mongo-express:latest

# Start fresh
docker-compose up -d
```

## Production Notes

⚠️ **Important**: The Docker setup is for **development only**. For production:

1. Use MongoDB Atlas or a managed MongoDB service
2. Change default passwords
3. Use environment variables for sensitive data
4. Enable authentication and network security
5. Set up proper backups
6. Use SSL/TLS connections

## Environment Variables Reference

| Variable | Docker Value | Description |
|----------|-------------|-------------|
| `MONGODB_URI` | `mongodb://admin:admin123@localhost:27017/easy-car?authSource=admin` | MongoDB connection string |
| `NEXTAUTH_URL` | `http://localhost:3000` | Application URL |
| `NEXTAUTH_SECRET` | (generate with `openssl rand -base64 32`) | NextAuth secret key |

## Next Steps

After MongoDB is running:

1. ✅ Set up environment variables (`.env.local`)
2. ✅ Install dependencies (`npm install`)
3. ✅ Create database indexes (`npm run setup-indexes`)
4. ✅ Create admin user (`npx tsx scripts/create-admin.ts ...`)
5. ✅ Start the app (`npm run dev`)

## Additional Resources

- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Mongo Express Documentation](https://github.com/mongo-express/mongo-express)
- [Docker Compose Documentation](https://docs.docker.com/compose/)


