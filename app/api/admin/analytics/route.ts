import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getAgenciesCollection,
  getUsersCollection,
  getVehiclesCollection,
  getReservationsCollection,
} from "@/lib/db/models";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can access analytics
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const agenciesCollection = await getAgenciesCollection();
    const usersCollection = await getUsersCollection();
    const vehiclesCollection = await getVehiclesCollection();
    const reservationsCollection = await getReservationsCollection();

    // Get date range from query params (default: last 30 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Basic counts
    const [
      totalAgencies,
      totalUsers,
      totalVehicles,
      totalReservations,
      totalManagers,
      totalClients,
    ] = await Promise.all([
      agenciesCollection.countDocuments(),
      usersCollection.countDocuments(),
      vehiclesCollection.countDocuments(),
      reservationsCollection.countDocuments(),
      usersCollection.countDocuments({ role: "manager" }),
      usersCollection.countDocuments({ role: "client" }),
    ]);

    // Revenue analytics
    const allReservations = await reservationsCollection
      .find({
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate },
      })
      .toArray();

    const totalRevenue = allReservations.reduce(
      (sum, r) => sum + r.totalPrice,
      0
    );
    const totalDiscounts = allReservations.reduce(
      (sum, r) => sum + r.discountAmount,
      0
    );
    const averageReservationValue =
      allReservations.length > 0
        ? totalRevenue / allReservations.length
        : 0;

    // Reservations by status
    const reservationsByStatus = await Promise.all([
      reservationsCollection.countDocuments({ status: "pending" }),
      reservationsCollection.countDocuments({ status: "confirmed" }),
      reservationsCollection.countDocuments({ status: "completed" }),
      reservationsCollection.countDocuments({ status: "cancelled" }),
    ]);

    // Agency performance
    const agencies = await agenciesCollection.find({}).toArray();
    const agencyPerformance = await Promise.all(
      agencies.map(async (agency) => {
        const agencyReservations = await reservationsCollection
          .find({
            agencyId: agency._id,
            status: { $in: ["confirmed", "completed"] },
            createdAt: { $gte: startDate },
          })
          .toArray();

        const revenue = agencyReservations.reduce(
          (sum, r) => sum + r.totalPrice,
          0
        );
        const vehicleCount = await vehiclesCollection.countDocuments({
          agencyId: agency._id,
        });

        return {
          agencyId: agency._id?.toString(),
          agencyName: agency.name,
          reservationCount: agencyReservations.length,
          revenue,
          vehicleCount,
        };
      })
    );

    // Popular vehicles (most reserved)
    const vehicleReservationCounts = await reservationsCollection
      .aggregate([
        {
          $match: {
            status: { $in: ["confirmed", "completed"] },
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$vehicleId",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    const popularVehicles = await Promise.all(
      vehicleReservationCounts.map(async (item) => {
        const vehicle = await vehiclesCollection.findOne({
          _id: new ObjectId(item._id),
        });
        return {
          vehicleId: item._id.toString(),
          vehicleName: vehicle
            ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
            : "Unknown",
          reservationCount: item.count,
          totalRevenue: item.totalRevenue,
        };
      })
    );

    // Recent activity (last 10 reservations)
    const recentReservations = await reservationsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Vehicle availability stats
    const availableVehicles = await vehiclesCollection.countDocuments({
      isAvailable: true,
    });
    const unavailableVehicles = totalVehicles - availableVehicles;

    // User growth (new users in period)
    const newUsers = await usersCollection.countDocuments({
      createdAt: { $gte: startDate },
    });

    return NextResponse.json({
      overview: {
        totalAgencies,
        totalUsers,
        totalVehicles,
        totalReservations,
        totalManagers,
        totalClients,
        availableVehicles,
        unavailableVehicles,
        newUsers,
      },
      revenue: {
        totalRevenue,
        totalDiscounts,
        averageReservationValue,
        period: days,
      },
      reservations: {
        byStatus: {
          pending: reservationsByStatus[0],
          confirmed: reservationsByStatus[1],
          completed: reservationsByStatus[2],
          cancelled: reservationsByStatus[3],
        },
        recent: recentReservations.map((r) => ({
          id: r._id?.toString(),
          customerName: r.customerName,
          totalPrice: r.totalPrice,
          status: r.status,
          createdAt: r.createdAt,
        })),
      },
      agencyPerformance: agencyPerformance.sort(
        (a, b) => b.revenue - a.revenue
      ),
      popularVehicles,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

