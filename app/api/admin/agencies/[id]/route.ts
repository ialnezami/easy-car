import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getAgenciesCollection } from "@/lib/db/models";
import { ObjectId } from "mongodb";
import { agencySchema } from "@/lib/utils/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agenciesCollection = await getAgenciesCollection();
    const agency = await agenciesCollection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(agency);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agency" },
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
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = agencySchema.parse(body);

    const agenciesCollection = await getAgenciesCollection();
    
    // Check if slug already exists for another agency
    const existing = await agenciesCollection.findOne({
      slug: validatedData.slug,
      _id: { $ne: new ObjectId(params.id) },
    });
    
    if (existing) {
      return NextResponse.json(
        { error: "Agency with this slug already exists" },
        { status: 400 }
      );
    }

    const result = await agenciesCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    const updatedAgency = await agenciesCollection.findOne({
      _id: new ObjectId(params.id),
    });

    return NextResponse.json(updatedAgency);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update agency" },
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
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agenciesCollection = await getAgenciesCollection();
    const result = await agenciesCollection.deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete agency" },
      { status: 500 }
    );
  }
}

