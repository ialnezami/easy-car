#!/bin/bash

# Quick start script for Docker setup
# This script sets up everything needed to run the app with Docker MongoDB

set -e

echo "🚀 Easy Car - Quick Start with Docker"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from Docker template..."
    cp .env.docker.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  Please generate a NEXTAUTH_SECRET:"
    echo "   Run: openssl rand -base64 32"
    echo "   Then update NEXTAUTH_SECRET in .env.local"
    echo ""
    read -p "Press Enter to continue after updating .env.local..."
fi

# Start Docker containers
echo "🐳 Starting MongoDB containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Wait for MongoDB
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker exec easy-car-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB is ready!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "❌ MongoDB failed to start"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
fi

# Set up indexes
echo ""
echo "🔧 Setting up database indexes..."
npm run setup-indexes

# Create admin user
echo ""
echo "👤 Creating admin user..."
read -p "Agency slug (default: agence1): " AGENCY_SLUG
AGENCY_SLUG=${AGENCY_SLUG:-agence1}

read -p "Agency name (default: Agency 1): " AGENCY_NAME
AGENCY_NAME=${AGENCY_NAME:-Agency 1}

read -p "Admin email (default: admin@agence1.com): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@agence1.com}

read -p "Admin password (default: admin123): " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}

read -p "Admin name (default: Admin User): " ADMIN_NAME
ADMIN_NAME=${ADMIN_NAME:-Admin User}

npx tsx scripts/create-admin.ts "$AGENCY_SLUG" "$AGENCY_NAME" "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "$ADMIN_NAME"

echo ""
echo "✨ Setup complete!"
echo ""
echo "🎉 You're ready to go!"
echo ""
echo "📝 Next steps:"
echo "   1. Start the dev server: npm run dev"
echo "   2. Open: http://localhost:3000"
echo "   3. Sign in with: $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo ""
echo "🌐 Mongo Express UI: http://localhost:8081"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🛑 To stop MongoDB: npm run docker:down"

