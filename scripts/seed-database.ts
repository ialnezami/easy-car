import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import {
  getAgenciesCollection,
  getUsersCollection,
  getVehiclesCollection,
  getDiscountsCollection,
  type Agency,
  type User,
  type Vehicle,
  type Discount,
} from "@/lib/db/models";

const DEFAULT_PASSWORD = "password123";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    const agenciesCollection = await getAgenciesCollection();
    const usersCollection = await getUsersCollection();
    const vehiclesCollection = await getVehiclesCollection();
    const discountsCollection = await getDiscountsCollection();

    await agenciesCollection.deleteMany({});
    await usersCollection.deleteMany({});
    await vehiclesCollection.deleteMany({});
    await discountsCollection.deleteMany({});
    console.log("✅ Cleared existing data\n");

    // Create Agencies
    console.log("Creating agencies...");
    const agencies: Agency[] = [
      {
        name: "Premium Car Rentals",
        slug: "premium-car-rentals",
        email: "info@premiumcarrentals.com",
        phone: "+1-555-0101",
        address: "123 Main Street, New York, NY 10001",
        description: "Luxury vehicles for discerning customers. Premium service, premium cars.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "City Wheels",
        slug: "city-wheels",
        email: "contact@citywheels.com",
        phone: "+1-555-0102",
        address: "456 Downtown Ave, Los Angeles, CA 90001",
        description: "Affordable and reliable car rentals in the heart of the city.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "EcoDrive Rentals",
        slug: "ecodrive-rentals",
        email: "hello@ecodrive.com",
        phone: "+1-555-0103",
        address: "789 Green Boulevard, San Francisco, CA 94102",
        description: "Sustainable transportation solutions. Electric and hybrid vehicles available.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const insertedAgencies = await agenciesCollection.insertMany(agencies);
    const agencyIds = Object.values(insertedAgencies.insertedIds);
    console.log(`✅ Created ${agencies.length} agencies\n`);

    // Create Users
    console.log("Creating users...");
    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

    const users: User[] = [
      // Admin (no agencyId - can manage all)
      {
        email: "admin@easycar.com",
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
        phone: "+1-555-0001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Managers (one for each agency)
      {
        email: "manager@premiumcarrentals.com",
        password: hashedPassword,
        name: "John Manager",
        agencyId: agencyIds[0],
        role: "manager",
        phone: "+1-555-1001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "manager@citywheels.com",
        password: hashedPassword,
        name: "Sarah Manager",
        agencyId: agencyIds[1],
        role: "manager",
        phone: "+1-555-1002",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "manager@ecodrive.com",
        password: hashedPassword,
        name: "Mike Manager",
        agencyId: agencyIds[2],
        role: "manager",
        phone: "+1-555-1003",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Clients
      {
        email: "client1@example.com",
        password: hashedPassword,
        name: "Alice Johnson",
        role: "client",
        phone: "+1-555-2001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "client2@example.com",
        password: hashedPassword,
        name: "Bob Smith",
        role: "client",
        phone: "+1-555-2002",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "client3@example.com",
        password: hashedPassword,
        name: "Carol Williams",
        role: "client",
        phone: "+1-555-2003",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const insertedUsers = await usersCollection.insertMany(users);
    const userIds = Object.values(insertedUsers.insertedIds);
    console.log(`✅ Created ${users.length} users\n`);

    // Create Vehicles
    console.log("Creating vehicles...");
    const vehicles: Vehicle[] = [
      // Premium Car Rentals vehicles
      {
        agencyId: agencyIds[0],
        make: "Mercedes-Benz",
        model: "E-Class",
        year: 2023,
        color: "Black",
        licensePlate: "PRE-001",
        images: [
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
          "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800",
        ],
        features: ["Leather Seats", "Sunroof", "Navigation", "Bluetooth", "Backup Camera"],
        seats: 5,
        transmission: "automatic",
        fuelType: "gasoline",
        pricing: {
          daily: 150,
          weekly: 900,
          monthly: 3500,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[0],
        make: "BMW",
        model: "5 Series",
        year: 2023,
        color: "White",
        licensePlate: "PRE-002",
        images: [
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
        ],
        features: ["Premium Sound", "Heated Seats", "Parking Sensors", "Adaptive Cruise"],
        seats: 5,
        transmission: "automatic",
        fuelType: "gasoline",
        pricing: {
          daily: 140,
          weekly: 850,
          monthly: 3300,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[0],
        make: "Audi",
        model: "A6",
        year: 2022,
        color: "Silver",
        licensePlate: "PRE-003",
        images: [
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
        ],
        features: ["Quattro AWD", "Virtual Cockpit", "Panoramic Sunroof", "Wireless Charging"],
        seats: 5,
        transmission: "automatic",
        fuelType: "gasoline",
        pricing: {
          daily: 145,
          weekly: 880,
          monthly: 3400,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[0],
        make: "Tesla",
        model: "Model 3",
        year: 2023,
        color: "Red",
        licensePlate: "PRE-004",
        images: [
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
        ],
        features: ["Autopilot", "Supercharging", "Premium Interior", "Full Self-Driving"],
        seats: 5,
        transmission: "automatic",
        fuelType: "electric",
        pricing: {
          daily: 120,
          weekly: 750,
          monthly: 2900,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // City Wheels vehicles
      {
        agencyId: agencyIds[1],
        make: "Toyota",
        model: "Camry",
        year: 2023,
        color: "Blue",
        licensePlate: "CITY-001",
        images: [
          "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
        ],
        features: ["Apple CarPlay", "Safety Sense", "Fuel Efficient", "Spacious"],
        seats: 5,
        transmission: "automatic",
        fuelType: "gasoline",
        pricing: {
          daily: 45,
          weekly: 280,
          monthly: 1100,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[1],
        make: "Honda",
        model: "Accord",
        year: 2023,
        color: "Gray",
        licensePlate: "CITY-002",
        images: [
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
        ],
        features: ["Honda Sensing", "Android Auto", "Eco Mode", "Lane Assist"],
        seats: 5,
        transmission: "automatic",
        fuelType: "gasoline",
        pricing: {
          daily: 48,
          weekly: 290,
          monthly: 1150,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[1],
        make: "Nissan",
        model: "Altima",
        year: 2022,
        color: "White",
        licensePlate: "CITY-003",
        images: [
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        ],
        features: ["ProPilot Assist", "NissanConnect", "Zero Gravity Seats", "Smart Key"],
        seats: 5,
        transmission: "automatic",
        fuelType: "gasoline",
        pricing: {
          daily: 42,
          weekly: 260,
          monthly: 1000,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[1],
        make: "Ford",
        model: "Explorer",
        year: 2023,
        color: "Black",
        licensePlate: "CITY-004",
        images: [
          "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
        ],
        features: ["7 Seats", "AWD", "SYNC 4", "Co-Pilot360", "Towing Package"],
        seats: 7,
        transmission: "automatic",
        fuelType: "gasoline",
        pricing: {
          daily: 75,
          weekly: 480,
          monthly: 1800,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[1],
        make: "Chevrolet",
        model: "Malibu",
        year: 2022,
        color: "Silver",
        licensePlate: "CITY-005",
        images: [
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
        ],
        features: ["Chevy MyLink", "OnStar", "Teen Driver", "Wireless Charging"],
        seats: 5,
        transmission: "automatic",
        fuelType: "gasoline",
        pricing: {
          daily: 40,
          weekly: 250,
          monthly: 950,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // EcoDrive Rentals vehicles
      {
        agencyId: agencyIds[2],
        make: "Tesla",
        model: "Model Y",
        year: 2023,
        color: "White",
        licensePlate: "ECO-001",
        images: [
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
        ],
        features: ["Autopilot", "7 Seats", "Supercharging", "Premium Audio"],
        seats: 7,
        transmission: "automatic",
        fuelType: "electric",
        pricing: {
          daily: 110,
          weekly: 700,
          monthly: 2700,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[2],
        make: "Toyota",
        model: "Prius",
        year: 2023,
        color: "Blue",
        licensePlate: "ECO-002",
        images: [
          "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
        ],
        features: ["Hybrid System", "Eco Mode", "Solar Roof", "Advanced Safety"],
        seats: 5,
        transmission: "automatic",
        fuelType: "hybrid",
        pricing: {
          daily: 55,
          weekly: 340,
          monthly: 1300,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[2],
        make: "Hyundai",
        model: "Ioniq 5",
        year: 2023,
        color: "Green",
        licensePlate: "ECO-003",
        images: [
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
        ],
        features: ["Ultra-Fast Charging", "V2L", "AR HUD", "Bose Audio"],
        seats: 5,
        transmission: "automatic",
        fuelType: "electric",
        pricing: {
          daily: 95,
          weekly: 600,
          monthly: 2300,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[2],
        make: "Nissan",
        model: "Leaf",
        year: 2022,
        color: "White",
        licensePlate: "ECO-004",
        images: [
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        ],
        features: ["e-Pedal", "ProPilot", "NissanConnect EV", "Eco Mode"],
        seats: 5,
        transmission: "automatic",
        fuelType: "electric",
        pricing: {
          daily: 65,
          weekly: 400,
          monthly: 1500,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[2],
        make: "Toyota",
        model: "RAV4 Hybrid",
        year: 2023,
        color: "Silver",
        licensePlate: "ECO-005",
        images: [
          "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
        ],
        features: ["AWD", "Hybrid System", "Safety Sense 2.0", "Apple CarPlay"],
        seats: 5,
        transmission: "automatic",
        fuelType: "hybrid",
        pricing: {
          daily: 70,
          weekly: 450,
          monthly: 1700,
        },
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await vehiclesCollection.insertMany(vehicles);
    console.log(`✅ Created ${vehicles.length} vehicles\n`);

    // Create Discounts
    console.log("Creating discounts...");
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const discounts: Discount[] = [
      {
        agencyId: agencyIds[0],
        code: "PREMIUM10",
        type: "percentage",
        value: 10,
        minRentalDays: 3,
        validFrom: now,
        validTo: nextMonth,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[0],
        code: "WEEKEND20",
        type: "percentage",
        value: 20,
        minRentalDays: 2,
        maxRentalDays: 3,
        validFrom: now,
        validTo: nextMonth,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[1],
        code: "CITY50",
        type: "fixed",
        value: 50,
        minRentalDays: 7,
        validFrom: now,
        validTo: nextMonth,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agencyId: agencyIds[2],
        code: "ECO15",
        type: "percentage",
        value: 15,
        minRentalDays: 5,
        validFrom: now,
        validTo: nextMonth,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await discountsCollection.insertMany(discounts);
    console.log(`✅ Created ${discounts.length} discounts\n`);

    console.log("🎉 Database seeding completed successfully!\n");
    console.log("📋 Summary:");
    console.log(`   - ${agencies.length} agencies`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${vehicles.length} vehicles`);
    console.log(`   - ${discounts.length} discounts\n`);
    console.log("🔑 Default password for all users: " + DEFAULT_PASSWORD + "\n");
    console.log("👤 Test Accounts:");
    console.log("   Admin: admin@easycar.com");
    console.log("   Manager (Premium): manager@premiumcarrentals.com");
    console.log("   Manager (City Wheels): manager@citywheels.com");
    console.log("   Manager (EcoDrive): manager@ecodrive.com");
    console.log("   Client 1: client1@example.com");
    console.log("   Client 2: client2@example.com");
    console.log("   Client 3: client3@example.com\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("✅ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });

