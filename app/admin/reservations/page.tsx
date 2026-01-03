import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getReservationsCollection,
  getVehiclesCollection,
  getAgenciesCollection,
} from "@/lib/db/models";
import { ObjectId } from "mongodb";
import { format } from "date-fns";

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return null;
  }

  const reservationsCollection = await getReservationsCollection();
  const query: any = {};
  
  if (searchParams.status) {
    query.status = searchParams.status;
  }

  const reservations = await reservationsCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  const vehiclesCollection = await getVehiclesCollection();
  const agenciesCollection = await getAgenciesCollection();

  const vehicleIds = reservations.map((r) => r.vehicleId);
  const agencyIds = reservations.map((r) => r.agencyId);

  const [vehicles, agencies] = await Promise.all([
    vehiclesCollection.find({ _id: { $in: vehicleIds } }).toArray(),
    agenciesCollection.find({ _id: { $in: agencyIds } }).toArray(),
  ]);

  const vehicleMap = new Map(vehicles.map((v) => [v._id?.toString(), v]));
  const agencyMap = new Map(agencies.map((a) => [a._id?.toString(), a]));

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
          All Reservations
        </h2>
        <p className="text-slate-600">
          View and manage reservations across all agencies
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <a
          href="/admin/reservations"
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            !searchParams.status
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          All
        </a>
        <a
          href="/admin/reservations?status=pending"
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            searchParams.status === "pending"
              ? "border-warning-500 text-warning-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Pending
        </a>
        <a
          href="/admin/reservations?status=confirmed"
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            searchParams.status === "confirmed"
              ? "border-success-500 text-success-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Confirmed
        </a>
        <a
          href="/admin/reservations?status=completed"
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            searchParams.status === "completed"
              ? "border-info-500 text-info-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Completed
        </a>
      </div>

      {reservations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-2">
            No reservations found
          </h3>
          <p className="text-slate-600">
            {searchParams.status
              ? `No ${searchParams.status} reservations.`
              : "No reservations have been made yet."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Agency
                  </th>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {reservations.map((reservation) => {
                  const vehicle = vehicleMap.get(reservation.vehicleId.toString());
                  const agency = agencyMap.get(reservation.agencyId.toString());
                  return (
                    <tr key={reservation._id?.toString()} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          {agency?.name || "Unknown"}
                        </div>
                      </td>
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

