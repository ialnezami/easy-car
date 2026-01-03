import { NextRequest, NextResponse } from "next/server";
import { getVehiclesCollection, getDiscountsCollection } from "@/lib/db/models";
import { ObjectId } from "mongodb";
import { calculatePricing } from "@/lib/utils/pricing";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const discountCode = searchParams.get("discountCode");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

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

    let discount;
    if (discountCode) {
      const discountsCollection = await getDiscountsCollection();
      discount = await discountsCollection.findOne({
        code: discountCode,
        agencyId: vehicle.agencyId,
        isActive: true,
      });
    }

    const pricing = calculatePricing(
      vehicle,
      new Date(startDate),
      new Date(endDate),
      discount || undefined
    );

    return NextResponse.json({ pricing });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to calculate pricing" },
      { status: 500 }
    );
  }
}


