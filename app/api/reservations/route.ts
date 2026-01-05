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
    
    // Filter by user role
    if (session) {
      if (session.user.role === "client") {
        query.userId = new ObjectId(session.user.id);
      } else if (session.user.role === "manager" || session.user.role === "admin") {
        // Managers see all reservations for their agency
        if (agencyId) {
          query.agencyId = new ObjectId(agencyId);
        }
      }
    } else {
      // Public users only see confirmed reservations
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
    // Require client authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "client") {
      return NextResponse.json(
        { error: "Authentication required. Please sign in as a client." },
        { status: 401 }
      );
    }

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

    // Check if vehicle is available
    if (!vehicle.isAvailable) {
      return NextResponse.json(
        { error: "This vehicle is currently not available for rental" },
        { status: 400 }
      );
    }

    // Check date availability
    const existingReservations = await reservationsCollection
      .find({
        vehicleId: new ObjectId(validatedData.vehicleId),
        status: { $in: ["pending", "confirmed"] },
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
      userId: new ObjectId(session.user.id),
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
      driverLicenseUrl: validatedData.driverLicenseUrl || undefined,
      idDocumentUrl: validatedData.idDocumentUrl || undefined,
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

