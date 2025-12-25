import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getReservationsCollection,
  getVehiclesCollection,
} from "@/lib/db/models";
import { ObjectId } from "mongodb";
import { format } from "date-fns";

export default async function ReservationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.agencyId) {
    redirect("/auth/signin");
  }

  const reservationsCollection = await getReservationsCollection();
  const reservations = await reservationsCollection
    .find({
      agencyId: new ObjectId(session.user.agencyId),
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

  const vehicleMap = new Map(
    vehicles.map((v) => [v._id?.toString(), v])
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Reservations</h2>

      {reservations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No reservations yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => {
                const vehicle = vehicleMap.get(
                  reservation.vehicleId.toString()
                );
                return (
                  <tr key={reservation._id?.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehicle
                        ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.customerEmail}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(reservation.startDate), "MMM d")} -{" "}
                      {format(new Date(reservation.endDate), "MMM d, yyyy")}
                      <br />
                      <span className="text-xs">
                        ({reservation.totalDays} days)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${reservation.totalPrice.toFixed(2)}
                      {reservation.discountAmount > 0 && (
                        <span className="text-xs text-green-600 block">
                          (Saved ${reservation.discountAmount.toFixed(2)})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reservation.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : reservation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : reservation.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {reservation.status === "pending" && (
                        <div className="flex gap-2">
                          <form
                            action={`/api/reservations/${reservation._id}`}
                            method="PATCH"
                          >
                            <input
                              type="hidden"
                              name="status"
                              value="confirmed"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                            >
                              Confirm
                            </button>
                          </form>
                          <form
                            action={`/api/reservations/${reservation._id}`}
                            method="PATCH"
                          >
                            <input
                              type="hidden"
                              name="status"
                              value="cancelled"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      )}
                      {reservation.status === "confirmed" && (
                        <form
                          action={`/api/reservations/${reservation._id}`}
                          method="PATCH"
                        >
                          <input type="hidden" name="status" value="completed" />
                          <button
                            type="submit"
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                          >
                            Mark Complete
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

