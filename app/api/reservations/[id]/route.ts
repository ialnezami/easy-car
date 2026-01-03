import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getReservationsCollection } from "@/lib/db/models";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const reservationsCollection = await getReservationsCollection();
    
    const reservation = await reservationsCollection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    if (session) {
      if (session.user.role === "client" && reservation.userId?.toString() !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if ((session.user.role === "manager" || session.user.role === "admin") && 
          reservation.agencyId.toString() !== session.user.agencyId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only managers/admins can update reservation status
    if (!session || (session.user.role !== "manager" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle both form data and JSON
    const contentType = request.headers.get("content-type");
    let status: string;
    
    if (contentType?.includes("application/json")) {
      const body = await request.json();
      status = body.status;
    } else {
      const formData = await request.formData();
      status = formData.get("status") as string;
    }

    // Validate and narrow the type
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;
    type ReservationStatus = typeof validStatuses[number];
    
    if (!validStatuses.includes(status as ReservationStatus)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const reservationStatus: ReservationStatus = status as ReservationStatus;

    const reservationsCollection = await getReservationsCollection();
    
    const reservation = await reservationsCollection.findOne({
      _id: new ObjectId(params.id),
      agencyId: new ObjectId(session.user.agencyId!),
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    const result = await reservationsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: reservationStatus,
          updatedAt: new Date(),
        },
      }
    );

    // Redirect if form submission, return JSON if API call
    if (contentType?.includes("application/json")) {
      return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
    } else {
      return NextResponse.redirect(new URL("/dashboard/reservations", request.url));
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}
