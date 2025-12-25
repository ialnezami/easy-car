import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getReservationsCollection,
  getVehiclesCollection,
  getDiscountsCollection,
} from "@/lib/db/models";
import { reservationSchema } from "@/lib/utils/validation";
import { ObjectId } from "mongodb";
import { calculatePricing, checkVehicleAvailability } from "@/lib/utils/pricing";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get("agencyId");
    const vehicleId = searchParams.get("vehicleId");

    const session = await getServerSession(authOptions);
    const reservationsCollection = await getReservationsCollection();
    
    const query: any = {};
    if (agencyId) {
      query.agencyId = new ObjectId(agencyId);
    }
    if (vehicleId) {
      query.vehicleId = new ObjectId(vehicleId);
    }
    
    // If not authenticated, only show confirmed reservations
    if (!session) {
      query.status = "confirmed";
    }

    const reservations = await reservationsCollection.find(query).toArray();
    return NextResponse.json(reservations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reservationSchema.parse(body);

    const vehiclesCollection = await getVehiclesCollection();
    const reservationsCollection = await getReservationsCollection();
    const discountsCollection = await getDiscountsCollection();

    // Get vehicle
    const vehicle = await vehiclesCollection.findOne({
      _id: new ObjectId(validatedData.vehicleId),
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Check availability
    const existingReservations = await reservationsCollection
      .find({
        vehicleId: new ObjectId(validatedData.vehicleId),
      })
      .toArray();

    const isAvailable = checkVehicleAvailability(
      validatedData.vehicleId,
      new Date(validatedData.startDate),
      new Date(validatedData.endDate),
      existingReservations.map((r) => ({
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status,
      }))
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: "Vehicle is not available for the selected dates" },
        { status: 400 }
      );
    }

    // Get discount if provided
    let discount;
    if (validatedData.discountCode) {
      discount = await discountsCollection.findOne({
        code: validatedData.discountCode,
        agencyId: vehicle.agencyId,
        isActive: true,
      });
    }

    // Calculate pricing
    const pricing = calculatePricing(
      vehicle,
      new Date(validatedData.startDate),
      new Date(validatedData.endDate),
      discount || undefined
    );

    const reservation = {
      agencyId: vehicle.agencyId,
      vehicleId: new ObjectId(validatedData.vehicleId),
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      customerPhone: validatedData.customerPhone,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      totalDays: pricing.totalDays,
      basePrice: pricing.basePrice,
      discountCode: validatedData.discountCode || undefined,
      discountAmount: pricing.discountAmount,
      totalPrice: pricing.totalPrice,
      status: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reservationsCollection.insertOne(reservation as any);
    return NextResponse.json(
      { _id: result.insertedId, ...reservation },
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
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

