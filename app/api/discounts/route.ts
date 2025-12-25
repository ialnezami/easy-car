import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getDiscountsCollection } from "@/lib/db/models";
import { discountSchema } from "@/lib/utils/validation";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get("agencyId");
    const code = searchParams.get("code");

    const discountsCollection = await getDiscountsCollection();
    const query: any = {};

    if (agencyId) {
      query.agencyId = new ObjectId(agencyId);
    }
    if (code) {
      query.code = code;
    }

    const discounts = await discountsCollection.find(query).toArray();
    return NextResponse.json(discounts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
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
    const validatedData = discountSchema.parse(body);

    const discountsCollection = await getDiscountsCollection();
    
    // Check if code already exists for this agency
    const existing = await discountsCollection.findOne({
      code: validatedData.code,
      agencyId: new ObjectId(session.user.agencyId),
    });
    
    if (existing) {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 400 }
      );
    }

    const discount = {
      ...validatedData,
      agencyId: new ObjectId(session.user.agencyId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await discountsCollection.insertOne(discount as any);
    return NextResponse.json(
      { _id: result.insertedId, ...discount },
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
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}

