import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getAgenciesCollection, getVehiclesCollection, getReservationsCollection } from "@/lib/db/models";
import { ObjectId } from "mongodb";
import Link from "next/link";

export default async function AdminAgenciesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return null;
  }

  const agenciesCollection = await getAgenciesCollection();
  const agencies = await agenciesCollection.find({}).sort({ createdAt: -1 }).toArray();

  // Get statistics for each agency
  const vehiclesCollection = await getVehiclesCollection();
  const reservationsCollection = await getReservationsCollection();

  const agenciesWithStats = await Promise.all(
    agencies.map(async (agency) => {
      const vehicleCount = await vehiclesCollection.countDocuments({
        agencyId: agency._id,
      });
      const reservationCount = await reservationsCollection.countDocuments({
        agencyId: agency._id,
      });
      const pendingReservations = await reservationsCollection.countDocuments({
        agencyId: agency._id,
        status: "pending",
      });

      return {
        ...agency,
        vehicleCount,
        reservationCount,
        pendingReservations,
      };
    })
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
            Agencies Management
          </h2>
          <p className="text-slate-600">
            View and manage all car rental agencies
          </p>
        </div>
        <Link href="/admin/agencies/new" className="btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Agency
        </Link>
      </div>

      {agenciesWithStats.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-2">
            No agencies found
          </h3>
          <p className="text-slate-600 mb-6">Create the first agency to get started.</p>
          <Link href="/admin/agencies/new" className="btn-primary">
            Create Agency
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agenciesWithStats.map((agency) => (
            <div key={agency._id?.toString()} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {agency.name.charAt(0)}
                </div>
                <Link
                  href={`/admin/agencies/${agency._id}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <h3 className="text-xl font-display font-semibold text-slate-900 mb-2">
                {agency.name}
              </h3>
              {agency.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{agency.description}</p>
              )}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Slug:</span>
                  <span className="font-medium text-slate-900">{agency.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium text-slate-900">{agency.email}</span>
                </div>
                {agency.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Phone:</span>
                    <span className="font-medium text-slate-900">{agency.phone}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-lg font-display font-bold text-slate-900">{agency.vehicleCount}</div>
                  <div className="text-xs text-slate-600">Vehicles</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-bold text-slate-900">{agency.reservationCount}</div>
                  <div className="text-xs text-slate-600">Reservations</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-bold text-warning-600">{agency.pendingReservations}</div>
                  <div className="text-xs text-slate-600">Pending</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <Link
                  href={`/${agency.slug}`}
                  target="_blank"
                  className="flex-1 btn-secondary text-center text-sm"
                >
                  View Public Page
                </Link>
                <Link
                  href={`/admin/agencies/${agency._id}`}
                  className="flex-1 btn-primary text-center text-sm"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

