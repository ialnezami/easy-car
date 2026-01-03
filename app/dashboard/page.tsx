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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Vehicles</h2>
        <Link
          href="/dashboard/vehicles/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No vehicles added yet.</p>
          <Link
            href="/dashboard/vehicles/new"
            className="text-blue-600 hover:text-blue-800"
          >
            Add your first vehicle →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id?.toString()}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {vehicle.images && vehicle.images.length > 0 ? (
                <div className="relative h-48 w-full bg-gray-200">
                  <Image
                    src={vehicle.images[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>License: {vehicle.licensePlate}</p>
                  <p>Daily: ${vehicle.pricing.daily}</p>
                  <p>
                    Status:{" "}
                    <span
                      className={
                        vehicle.isAvailable
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {vehicle.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/vehicles/${vehicle._id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
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
                      className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
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


