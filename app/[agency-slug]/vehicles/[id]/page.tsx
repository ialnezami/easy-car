import { notFound } from "next/navigation";
import {
  getAgenciesCollection,
  getVehiclesCollection,
  getReservationsCollection,
} from "@/lib/db/models";
import { ObjectId } from "mongodb";
import Link from "next/link";
import Image from "next/image";
import ReservationForm from "@/components/ReservationForm";

export default async function VehicleDetailPage({
  params,
}: {
  params: { "agency-slug": string; id: string };
}) {
  const agenciesCollection = await getAgenciesCollection();
  const agency = await agenciesCollection.findOne({
    slug: params["agency-slug"],
  });

  if (!agency) {
    notFound();
  }

  const vehiclesCollection = await getVehiclesCollection();
  const vehicle = await vehiclesCollection.findOne({
    _id: new ObjectId(params.id),
    agencyId: agency._id,
  });

  if (!vehicle) {
    notFound();
  }

  const reservationsCollection = await getReservationsCollection();
  const reservations = await reservationsCollection
    .find({
      vehicleId: vehicle._id,
      status: { $in: ["pending", "confirmed"] },
    })
    .toArray();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/${params["agency-slug"]}`}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to {agency.name}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {vehicle.images && vehicle.images.length > 0 ? (
              <div className="space-y-4">
                {vehicle.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-96 w-full bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`${vehicle.make} ${vehicle.model} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No Images Available</span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>

            <div className="space-y-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Details
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Color:</span>{" "}
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Seats:</span>{" "}
                    <span className="font-medium">{vehicle.seats}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Transmission:</span>{" "}
                    <span className="font-medium capitalize">
                      {vehicle.transmission}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fuel Type:</span>{" "}
                    <span className="font-medium capitalize">
                      {vehicle.fuelType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">License Plate:</span>{" "}
                    <span className="font-medium">{vehicle.licensePlate}</span>
                  </div>
                </div>
              </div>

              {vehicle.features && vehicle.features.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Features
                  </h2>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {vehicle.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Pricing
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily:</span>
                    <span className="font-bold text-blue-600">
                      ${vehicle.pricing.daily}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly:</span>
                    <span className="font-bold text-blue-600">
                      ${vehicle.pricing.weekly}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly:</span>
                    <span className="font-bold text-blue-600">
                      ${vehicle.pricing.monthly}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ReservationForm
              vehicleId={vehicle._id?.toString() || ""}
              agencySlug={params["agency-slug"]}
              reservations={reservations.map((r) => ({
                startDate: r.startDate,
                endDate: r.endDate,
              }))}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

