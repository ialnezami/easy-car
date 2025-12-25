/**
 * Script to create an admin user and agency
 * Run with: npx tsx scripts/create-admin.ts
 */

import { getDatabase } from "../lib/db/mongodb";
import bcrypt from "bcryptjs";

async function createAdmin() {
  try {
    const db = await getDatabase();
    const agenciesCollection = db.collection("agencies");
    const usersCollection = db.collection("users");

    // Create agency
    const agencySlug = process.argv[2] || "agence1";
    const agencyName = process.argv[3] || "Agency 1";

    let agency = await agenciesCollection.findOne({ slug: agencySlug });

    if (!agency) {
      const agencyResult = await agenciesCollection.insertOne({
        name: agencyName,
        slug: agencySlug,
        email: `admin@${agencySlug}.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      agency = await agenciesCollection.findOne({
        _id: agencyResult.insertedId,
      });
      console.log(`✅ Created agency: ${agencyName} (${agencySlug})`);
    } else {
      console.log(`ℹ️  Agency already exists: ${agencyName} (${agencySlug})`);
    }

    // Create admin user
    const email = process.argv[4] || `admin@${agencySlug}.com`;
    const password = process.argv[5] || "admin123";
    const name = process.argv[6] || "Admin User";

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      console.log(`ℹ️  User already exists: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      agencyId: agency!._id,
      role: "manager",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Created admin user:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Agency: ${agencyName}`);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin().then(() => {
  console.log("Done!");
  process.exit(0);
});

