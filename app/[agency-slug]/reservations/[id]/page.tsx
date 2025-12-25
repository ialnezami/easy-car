import { notFound } from "next/navigation";
import {
  getAgenciesCollection,
  getReservationsCollection,
  getVehiclesCollection,
} from "@/lib/db/models";
import { ObjectId } from "mongodb";
import { format } from "date-fns";
import Link from "next/link";

export default async function ReservationConfirmationPage({
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

  const reservationsCollection = await getReservationsCollection();
  const reservation = await reservationsCollection.findOne({
    _id: new ObjectId(params.id),
    agencyId: agency._id,
  });

  if (!reservation) {
    notFound();
  }

  const vehiclesCollection = await getVehiclesCollection();
  const vehicle = await vehiclesCollection.findOne({
    _id: reservation.vehicleId,
  });

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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reservation Confirmed!
            </h1>
            <p className="text-gray-600">
              Your reservation has been successfully created.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reservation Details
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reservation ID:</span>
                  <span className="font-medium">
                    {reservation._id?.toString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">
                    {vehicle
                      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pick-up Date:</span>
                  <span className="font-medium">
                    {format(new Date(reservation.startDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return Date:</span>
                  <span className="font-medium">
                    {format(new Date(reservation.endDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {reservation.totalDays} day
                    {reservation.totalDays !== 1 ? "s" : ""}
                  </span>
                </div>
                {reservation.discountCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount Code:</span>
                    <span className="font-medium text-green-600">
                      {reservation.discountCode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing Summary
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">
                    ${reservation.basePrice.toFixed(2)}
                  </span>
                </div>
                {reservation.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${reservation.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    ${reservation.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-gray-600">Name: </span>
                  <span className="font-medium">{reservation.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email: </span>
                  <span className="font-medium">
                    {reservation.customerEmail}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Phone: </span>
                  <span className="font-medium">
                    {reservation.customerPhone}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center">
                A confirmation email has been sent to {reservation.customerEmail}
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href={`/${params["agency-slug"]}`}
                className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Browse More Vehicles
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

