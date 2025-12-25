import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getVehiclesCollection } from "@/lib/db/models";
import { vehicleSchema } from "@/lib/utils/validation";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get("agencyId");

    const vehiclesCollection = await getVehiclesCollection();
    const query: any = {};

    if (agencyId) {
      query.agencyId = new ObjectId(agencyId);
    }

    const vehicles = await vehiclesCollection.find(query).toArray();
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = vehicleSchema.parse(body);

    const vehiclesCollection = await getVehiclesCollection();
    const vehicle = {
      ...validatedData,
      agencyId: new ObjectId(session.user.agencyId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await vehiclesCollection.insertOne(vehicle as any);
    return NextResponse.json(
      { _id: result.insertedId, ...vehicle },
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
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}

