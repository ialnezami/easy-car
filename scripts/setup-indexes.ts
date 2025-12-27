/**
 * Script to set up database indexes for performance
 * Run with: npx tsx scripts/setup-indexes.ts
 */

import { getDatabase } from "../lib/db/mongodb";

// Ensure Node.js types are available
declare const process: {
  exit: (code?: number) => never;
  argv: string[];
};

async function setupIndexes() {
  try {
    const db = await getDatabase();

    console.log("Setting up database indexes...\n");

    // Agencies Collection Indexes
    console.log("📋 Setting up agencies indexes...");
    const agenciesCollection = db.collection("agencies");
    
    // Unique index on slug (for multi-tenant routing)
    await agenciesCollection.createIndex({ slug: 1 }, { unique: true });
    console.log("  ✅ Created unique index on slug");
    
    // Index on email for lookups
    await agenciesCollection.createIndex({ email: 1 });
    console.log("  ✅ Created index on email");

    // Vehicles Collection Indexes
    console.log("\n🚗 Setting up vehicles indexes...");
    const vehiclesCollection = db.collection("vehicles");
    
    // Index on agencyId (most common query)
    await vehiclesCollection.createIndex({ agencyId: 1 });
    console.log("  ✅ Created index on agencyId");
    
    // Compound index for available vehicles by agency
    await vehiclesCollection.createIndex({ agencyId: 1, isAvailable: 1 });
    console.log("  ✅ Created compound index on agencyId + isAvailable");
    
    // Index on licensePlate for uniqueness checks
    await vehiclesCollection.createIndex({ licensePlate: 1 }, { unique: true, sparse: true });
    console.log("  ✅ Created unique index on licensePlate");

    // Reservations Collection Indexes
    console.log("\n📅 Setting up reservations indexes...");
    const reservationsCollection = db.collection("reservations");
    
    // Index on userId (for client dashboard)
    await reservationsCollection.createIndex({ userId: 1 });
    console.log("  ✅ Created index on userId");
    
    // Index on vehicleId (for availability checks)
    await reservationsCollection.createIndex({ vehicleId: 1 });
    console.log("  ✅ Created index on vehicleId");
    
    // Index on agencyId (for agency dashboard)
    await reservationsCollection.createIndex({ agencyId: 1 });
    console.log("  ✅ Created index on agencyId");
    
    // Compound index for agency reservations with status
    await reservationsCollection.createIndex({ agencyId: 1, status: 1 });
    console.log("  ✅ Created compound index on agencyId + status");
    
    // Compound index for vehicle availability checks (critical for performance)
    await reservationsCollection.createIndex({ 
      vehicleId: 1, 
      status: 1, 
      startDate: 1, 
      endDate: 1 
    });
    console.log("  ✅ Created compound index on vehicleId + status + dates");
    
    // Index on status for filtering
    await reservationsCollection.createIndex({ status: 1 });
    console.log("  ✅ Created index on status");
    
    // Index on dates for range queries
    await reservationsCollection.createIndex({ startDate: 1, endDate: 1 });
    console.log("  ✅ Created index on startDate + endDate");

    // Users Collection Indexes
    console.log("\n👤 Setting up users indexes...");
    const usersCollection = db.collection("users");
    
    // Unique index on email (for authentication)
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log("  ✅ Created unique index on email");
    
    // Index on agencyId (for manager lookups)
    await usersCollection.createIndex({ agencyId: 1 });
    console.log("  ✅ Created index on agencyId");
    
    // Compound index for role-based queries
    await usersCollection.createIndex({ role: 1, agencyId: 1 });
    console.log("  ✅ Created compound index on role + agencyId");

    // Discounts Collection Indexes
    console.log("\n💰 Setting up discounts indexes...");
    const discountsCollection = db.collection("discounts");
    
    // Compound unique index on code + agencyId (discount codes are unique per agency)
    await discountsCollection.createIndex({ code: 1, agencyId: 1 }, { unique: true });
    console.log("  ✅ Created unique compound index on code + agencyId");
    
    // Index on agencyId
    await discountsCollection.createIndex({ agencyId: 1 });
    console.log("  ✅ Created index on agencyId");
    
    // Compound index for active discounts lookup
    await discountsCollection.createIndex({ agencyId: 1, isActive: 1, code: 1 });
    console.log("  ✅ Created compound index on agencyId + isActive + code");
    
    // Index on validity dates for expired discount cleanup
    await discountsCollection.createIndex({ validTo: 1 });
    console.log("  ✅ Created index on validTo");

    console.log("\n✨ All indexes created successfully!");
    console.log("\n💡 Tip: You can verify indexes in MongoDB Atlas or using:");
    console.log("   db.collection('collectionName').getIndexes()");
    
  } catch (error: any) {
    if (error.code === 85) {
      console.error("⚠️  Index already exists. This is normal if you've run this script before.");
      console.error("   You can safely ignore this error.");
    } else if (error.code === 11000) {
      console.error("⚠️  Duplicate key error. Some documents may have duplicate values.");
      console.error("   Please check your data before creating unique indexes.");
    } else {
      console.error("❌ Error setting up indexes:", error);
      process.exit(1);
    }
  }
}

setupIndexes().then(() => {
  console.log("\n✅ Index setup complete!");
  process.exit(0);
});

