import { notFound } from "next/navigation";
import { getAgenciesCollection, getVehiclesCollection } from "@/lib/db/models";
import { ObjectId } from "mongodb";
import Link from "next/link";
import Image from "next/image";

export default async function AgencyPage({
  params,
}: {
  params: { "agency-slug": string };
}) {
  const agenciesCollection = await getAgenciesCollection();
  const agency = await agenciesCollection.findOne({
    slug: params["agency-slug"],
  });

  if (!agency) {
    notFound();
  }

  const vehiclesCollection = await getVehiclesCollection();
  const vehicles = await vehiclesCollection
    .find({
      agencyId: agency._id,
      isAvailable: true,
    })
    .toArray();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{agency.name}</h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Agencies
            </Link>
          </div>
          {agency.description && (
            <p className="text-gray-600 mt-2">{agency.description}</p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Available Vehicles
        </h2>

        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No vehicles available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle._id?.toString()}
                href={`/${params["agency-slug"]}/vehicles/${vehicle._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
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
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Color: {vehicle.color}</p>
                    <p>Seats: {vehicle.seats}</p>
                    <p>Transmission: {vehicle.transmission}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      ${vehicle.pricing.daily}/day
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


