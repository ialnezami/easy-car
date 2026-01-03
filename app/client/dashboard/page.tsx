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

  // Calculate statistics
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed").length;
  const pendingReservations = reservations.filter((r) => r.status === "pending").length;
  const totalSpent = reservations
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + r.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Navigation */}
      <nav className="glass border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white font-bold shadow-lg">
                EC
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-slate-900">My Bookings</h1>
                <p className="text-xs text-slate-500">Client Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-semibold">
                  {session.user.name?.charAt(0).toUpperCase() || session.user.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{session.user.name || "User"}</p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                </div>
              </div>
              <Link href="/client/profile" className="btn-secondary text-sm">
                Profile
              </Link>
              <Link href="/api/auth/signout" className="btn-secondary text-sm">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Browse More Vehicles
          </Link>
        </div>

        {/* Statistics Cards */}
        {totalReservations > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Bookings</p>
                  <p className="text-2xl font-display font-bold text-slate-900">{totalReservations}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Confirmed</p>
                  <p className="text-2xl font-display font-bold text-success-600">{confirmedReservations}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-success-500 to-success-600 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pending</p>
                  <p className="text-2xl font-display font-bold text-warning-600">{pendingReservations}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-display font-bold text-slate-900">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
            My Reservations
          </h2>
          <p className="text-slate-600">
            View and manage your car rental bookings
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
            <p className="text-slate-600 mb-6">Start exploring our available vehicles and make your first booking.</p>
            <Link href="/" className="btn-primary">
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const vehicle = vehicleMap.get(reservation.vehicleId.toString());
              return (
                <div
                  key={reservation._id?.toString()}
                  className="card p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-semibold text-slate-900 mb-3">
                        {vehicle
                          ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                          : "Unknown Vehicle"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500 mb-1">Pick-up Date</p>
                          <p className="font-semibold text-slate-900">
                            {format(new Date(reservation.startDate), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Return Date</p>
                          <p className="font-semibold text-slate-900">
                            {format(new Date(reservation.endDate), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Duration</p>
                          <p className="font-semibold text-slate-900">
                            {reservation.totalDays} day{reservation.totalDays !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right md:text-left md:min-w-[140px]">
                      {reservation.status === "confirmed" ? (
                        <span className="badge-success mb-2">Confirmed</span>
                      ) : reservation.status === "pending" ? (
                        <span className="badge-warning mb-2">Pending</span>
                      ) : reservation.status === "cancelled" ? (
                        <span className="badge-error mb-2">Cancelled</span>
                      ) : (
                        <span className="badge-info mb-2">Completed</span>
                      )}
                      <p className="text-2xl font-display font-bold gradient-text">
                        ${reservation.totalPrice.toFixed(2)}
                      </p>
                      {reservation.discountAmount > 0 && (
                        <p className="text-xs text-success-600 font-medium mt-1">
                          Saved ${reservation.discountAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {reservation.status === "pending" && (
                    <div className="mt-4 p-4 bg-warning-50 border-2 border-warning-200 rounded-xl flex items-start gap-3">
                      <svg className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-warning-900 mb-1">
                          Awaiting Confirmation
                        </p>
                        <p className="text-sm text-warning-700">
                          Your reservation is pending confirmation. You will be notified once it&apos;s confirmed.
                        </p>
                      </div>
                    </div>
                  )}

                  {reservation.status === "confirmed" && (
                    <div className="mt-4 p-4 bg-success-50 border-2 border-success-200 rounded-xl flex items-start gap-3">
                      <svg className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-success-900 mb-1">
                          Reservation Confirmed!
                        </p>
                        <p className="text-sm text-success-700">
                          Your reservation has been confirmed. We look forward to serving you!
                        </p>
                      </div>
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


