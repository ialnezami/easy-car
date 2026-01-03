import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getUsersCollection } from "@/lib/db/models";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["admin", "manager", "client"]),
  agencyId: z.string().optional(),
  phone: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const usersCollection = await getUsersCollection();
    
    // Check if email already exists
    const existing = await usersCollection.findOne({
      email: validatedData.email,
    });
    
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = {
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
      role: validatedData.role,
      agencyId: validatedData.agencyId ? new ObjectId(validatedData.agencyId) : undefined,
      phone: validatedData.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(user as any);
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { _id: result.insertedId, ...userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

