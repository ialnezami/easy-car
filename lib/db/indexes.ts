/**
 * Database indexes setup
 * This module can be imported to ensure indexes are created on app startup
 */

import { getDatabase } from "./mongodb";

export async function setupDatabaseIndexes() {
  try {
    const db = await getDatabase();

    // Agencies Collection
    const agenciesCollection = db.collection("agencies");
    await agenciesCollection.createIndex({ slug: 1 }, { unique: true });
    await agenciesCollection.createIndex({ email: 1 });

    // Vehicles Collection
    const vehiclesCollection = db.collection("vehicles");
    await vehiclesCollection.createIndex({ agencyId: 1 });
    await vehiclesCollection.createIndex({ agencyId: 1, isAvailable: 1 });
    await vehiclesCollection.createIndex({ licensePlate: 1 }, { unique: true, sparse: true });

    // Reservations Collection
    const reservationsCollection = db.collection("reservations");
    await reservationsCollection.createIndex({ userId: 1 });
    await reservationsCollection.createIndex({ vehicleId: 1 });
    await reservationsCollection.createIndex({ agencyId: 1 });
    await reservationsCollection.createIndex({ agencyId: 1, status: 1 });
    await reservationsCollection.createIndex({ 
      vehicleId: 1, 
      status: 1, 
      startDate: 1, 
      endDate: 1 
    });
    await reservationsCollection.createIndex({ status: 1 });
    await reservationsCollection.createIndex({ startDate: 1, endDate: 1 });

    // Users Collection
    const usersCollection = db.collection("users");
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ agencyId: 1 });
    await usersCollection.createIndex({ role: 1, agencyId: 1 });

    // Discounts Collection
    const discountsCollection = db.collection("discounts");
    await discountsCollection.createIndex({ code: 1, agencyId: 1 }, { unique: true });
    await discountsCollection.createIndex({ agencyId: 1 });
    await discountsCollection.createIndex({ agencyId: 1, isActive: 1, code: 1 });
    await discountsCollection.createIndex({ validTo: 1 });

    console.log("Database indexes initialized");
  } catch (error: any) {
    // Ignore duplicate index errors (indexes already exist)
    if (error.code !== 85 && error.code !== 11000) {
      console.error("Error setting up database indexes:", error);
    }
  }
}

