import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getVehiclesCollection } from "@/lib/db/models";
import { ObjectId } from "mongodb";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.agencyId) {
    redirect("/auth/signin");
  }

  const vehiclesCollection = await getVehiclesCollection();
  const vehicles = await vehiclesCollection
    .find({
      agencyId: new ObjectId(session.user.agencyId),
    })
    .toArray();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
            Vehicles
          </h2>
          <p className="text-slate-600">
            Manage your fleet of rental vehicles
          </p>
        </div>
        <Link
          href="/dashboard/vehicles/new"
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-2">
            No vehicles yet
          </h3>
          <p className="text-slate-600 mb-6">Get started by adding your first vehicle to the fleet.</p>
          <Link
            href="/dashboard/vehicles/new"
            className="btn-primary"
          >
            Add Your First Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id?.toString()}
              className="card overflow-hidden"
            >
              <div className="relative h-56 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <Image
                    src={vehicle.images[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  {vehicle.isAvailable ? (
                    <span className="badge-success">Available</span>
                  ) : (
                    <span className="badge-error">Unavailable</span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-display font-semibold text-slate-900 mb-3">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <div className="space-y-2 mb-4 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>License Plate:</span>
                    <span className="font-medium text-slate-900">{vehicle.licensePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Rate:</span>
                    <span className="font-semibold text-primary-600">${vehicle.pricing.daily}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <Link
                    href={`/dashboard/vehicles/${vehicle._id}`}
                    className="flex-1 btn-secondary text-center text-sm"
                  >
                    Edit
                  </Link>
                  <form
                    action={`/api/vehicles/${vehicle._id}`}
                    method="DELETE"
                    className="flex-1"
                  >
                    <button
                      type="submit"
                      className="w-full btn-danger text-sm"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


