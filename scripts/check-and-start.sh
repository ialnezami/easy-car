#!/bin/bash

echo "🔍 Easy Car - Setup Checker"
echo "============================"
echo ""

# Check Docker
echo "1. Checking Docker..."
if docker info > /dev/null 2>&1; then
    echo "   ✅ Docker is running"
    
    # Check if containers are running
    if docker-compose ps | grep -q "easy-car-mongodb.*Up"; then
        echo "   ✅ MongoDB container is running"
    else
        echo "   ⚠️  MongoDB container is not running"
        echo "   Starting MongoDB..."
        docker-compose up -d
        echo "   ⏳ Waiting for MongoDB to be ready..."
        sleep 10
    fi
else
    echo "   ❌ Docker is NOT running"
    echo ""
    echo "   Please start Docker Desktop and run this script again."
    echo "   Or run manually: docker-compose up -d"
    exit 1
fi

echo ""
echo "2. Checking environment..."
if [ -f .env.local ]; then
    echo "   ✅ .env.local exists"
    if grep -q "MONGODB_URI.*localhost:27017" .env.local; then
        echo "   ✅ MongoDB URI configured for Docker"
    else
        echo "   ⚠️  MongoDB URI might not be configured for Docker"
    fi
else
    echo "   ⚠️  .env.local not found, creating from Docker template..."
    cat > .env.local << 'EOF'
MONGODB_URI=mongodb://admin:admin123@localhost:27017/easy-car?authSource=admin
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-key-for-development-only-change-in-production
NODE_ENV=development
EOF
    echo "   ✅ Created .env.local"
fi

echo ""
echo "3. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ⚠️  Installing dependencies..."
    npm install
fi

echo ""
echo "4. Checking database indexes..."
echo "   Running index setup..."
npm run setup-indexes 2>&1 | grep -E "(✅|Error|error)" || echo "   ✅ Indexes checked"

echo ""
echo "5. Checking admin user..."
ADMIN_EXISTS=$(docker exec easy-car-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval "use easy-car; db.users.countDocuments({email: 'admin@agence1.com'})" 2>/dev/null | tr -d '\n\r ')
if [ "$ADMIN_EXISTS" = "0" ] || [ -z "$ADMIN_EXISTS" ]; then
    echo "   ⚠️  Admin user not found, creating..."
    npx tsx scripts/create-admin.ts agence1 "Agency 1" admin@agence1.com admin123 "Admin User" 2>&1 | tail -3
else
    echo "   ✅ Admin user exists"
fi

echo ""
echo "============================"
echo "✨ Setup Complete!"
echo ""
echo "🚀 Starting development server..."
echo "   Open http://localhost:3000 in your browser"
echo ""
echo "📝 Credentials:"
echo "   Admin: admin@agence1.com / admin123"
echo "   Mongo Express: http://localhost:8081 (admin / admin123)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev


