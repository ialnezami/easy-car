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
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
          Reservations
        </h2>
        <p className="text-slate-600">
          Manage and track all vehicle reservations
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-2">
            No reservations yet
          </h3>
          <p className="text-slate-600">Reservations will appear here once customers start booking.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {reservations.map((reservation) => {
                  const vehicle = vehicleMap.get(
                    reservation.vehicleId.toString()
                  );
                  return (
                    <tr key={reservation._id?.toString()} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {vehicle
                            ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                            : "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {reservation.customerName}
                          </div>
                          <div className="text-sm text-slate-600">
                            {reservation.customerEmail}
                          </div>
                          <div className="text-xs text-slate-500">
                            {reservation.customerPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-medium">
                          {format(new Date(reservation.startDate), "MMM d")} -{" "}
                          {format(new Date(reservation.endDate), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-slate-500">
                          {reservation.totalDays} day{reservation.totalDays !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-display font-bold text-slate-900">
                          ${reservation.totalPrice.toFixed(2)}
                        </div>
                        {reservation.discountAmount > 0 && (
                          <div className="text-xs text-success-600 font-medium">
                            Saved ${reservation.discountAmount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.status === "confirmed" ? (
                          <span className="badge-success">Confirmed</span>
                        ) : reservation.status === "pending" ? (
                          <span className="badge-warning">Pending</span>
                        ) : reservation.status === "cancelled" ? (
                          <span className="badge-error">Cancelled</span>
                        ) : (
                          <span className="badge-info">Completed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.status === "pending" && (
                          <div className="flex gap-2">
                            <form
                              action={`/api/reservations/${reservation._id}`}
                              method="PATCH"
                            >
                              <input type="hidden" name="status" value="confirmed" />
                              <button type="submit" className="btn-success text-xs px-3 py-1.5">
                                Confirm
                              </button>
                            </form>
                            <form
                              action={`/api/reservations/${reservation._id}`}
                              method="PATCH"
                            >
                              <input type="hidden" name="status" value="cancelled" />
                              <button type="submit" className="btn-danger text-xs px-3 py-1.5">
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
                            <button type="submit" className="btn-secondary text-xs px-3 py-1.5">
                              Complete
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
        </div>
      )}
    </div>
  );
}

