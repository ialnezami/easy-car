#!/bin/bash

# Test script for Docker MongoDB setup
# Usage: ./scripts/test-docker-setup.sh

set -e

echo "🐳 Testing Docker MongoDB Setup"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  docker-compose not found, trying 'docker compose'..."
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "📦 Starting MongoDB containers..."
$DOCKER_COMPOSE up -d

echo ""
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Wait for MongoDB to be healthy
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker exec easy-car-mongodb mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB is ready!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "❌ MongoDB failed to start"
    exit 1
fi

echo ""
echo "🔍 Testing MongoDB connection..."
if docker exec easy-car-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB connection successful!"
else
    echo "❌ MongoDB connection failed"
    exit 1
fi

echo ""
echo "📊 Container Status:"
$DOCKER_COMPOSE ps

echo ""
echo "✨ Docker setup test completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Copy .env.docker.example to .env.local"
echo "   2. Run: npm run setup-indexes"
echo "   3. Run: npx tsx scripts/create-admin.ts agence1 'Agency 1' admin@agence1.com admin123 'Admin User'"
echo "   4. Run: npm run dev"
echo ""
echo "🌐 Access Mongo Express at: http://localhost:8081"
echo "   Username: admin"
echo "   Password: admin123"


