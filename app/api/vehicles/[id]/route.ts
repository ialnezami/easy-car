import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getVehiclesCollection } from "@/lib/db/models";
import { vehicleSchema } from "@/lib/utils/validation";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehiclesCollection = await getVehiclesCollection();
    const vehicle = await vehiclesCollection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = vehicleSchema.parse(body);

    const vehiclesCollection = await getVehiclesCollection();
    
    // Verify vehicle belongs to agency
    const existing = await vehiclesCollection.findOne({
      _id: new ObjectId(params.id),
      agencyId: new ObjectId(session.user.agencyId),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Vehicle not found or unauthorized" },
        { status: 404 }
      );
    }

    const result = await vehiclesCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehiclesCollection = await getVehiclesCollection();
    
    const result = await vehiclesCollection.deleteOne({
      _id: new ObjectId(params.id),
      agencyId: new ObjectId(session.user.agencyId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Vehicle not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}


