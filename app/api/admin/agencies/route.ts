import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getAgenciesCollection } from "@/lib/db/models";
import { agencySchema } from "@/lib/utils/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agenciesCollection = await getAgenciesCollection();
    const agencies = await agenciesCollection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(agencies);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agencies" },
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
    const validatedData = agencySchema.parse(body);

    const agenciesCollection = await getAgenciesCollection();
    
    // Check if slug already exists
    const existing = await agenciesCollection.findOne({
      slug: validatedData.slug,
    });
    
    if (existing) {
      return NextResponse.json(
        { error: "Agency with this slug already exists" },
        { status: 400 }
      );
    }

    const agency = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await agenciesCollection.insertOne(agency as any);
    return NextResponse.json(
      { _id: result.insertedId, ...agency },
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
      { error: "Failed to create agency" },
      { status: 500 }
    );
  }
}

