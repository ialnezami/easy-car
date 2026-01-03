import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getReservationsCollection, getVehiclesCollection } from "@/lib/db/models";
import { ObjectId } from "mongodb";
import { format } from "date-fns";
import Link from "next/link";

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "client") {
    redirect("/auth/signin");
  }

  const reservationsCollection = await getReservationsCollection();
  const reservations = await reservationsCollection
    .find({
      userId: new ObjectId(session.user.id),
    })
    .sort({ createdAt: -1 })
    .toArray();

  const vehiclesCollection = await getVehiclesCollection();
  const vehicleIds = reservations.map((r) => r.vehicleId);
  const vehicles = await vehiclesCollection
    .find({
      _id: { $in: vehicleIds },
    })
    .toArray();

  const vehicleMap = new Map(vehicles.map((v) => [v._id?.toString(), v]));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{session.user.email}</span>
              <Link
                href="/api/auth/signout"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Browse Vehicles
          </Link>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">My Reservations</h2>

        {reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">You haven't made any reservations yet.</p>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              Browse available vehicles →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const vehicle = vehicleMap.get(reservation.vehicleId.toString());
              return (
                <div
                  key={reservation._id?.toString()}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {vehicle
                          ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                          : "Unknown Vehicle"}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Pick-up:</span>{" "}
                          {format(new Date(reservation.startDate), "MMMM d, yyyy")}
                        </p>
                        <p>
                          <span className="font-medium">Return:</span>{" "}
                          {format(new Date(reservation.endDate), "MMMM d, yyyy")}
                        </p>
                        <p>
                          <span className="font-medium">Duration:</span>{" "}
                          {reservation.totalDays} day
                          {reservation.totalDays !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reservation.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : reservation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : reservation.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {reservation.status.charAt(0).toUpperCase() +
                          reservation.status.slice(1)}
                      </span>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        ${reservation.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {reservation.status === "pending" && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        ⏳ Your reservation is pending confirmation. You will be notified once it's confirmed.
                      </p>
                    </div>
                  )}

                  {reservation.status === "confirmed" && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        ✅ Your reservation has been confirmed!
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}


