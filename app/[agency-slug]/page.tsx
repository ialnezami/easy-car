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
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-1">
                {agency.name}
              </h1>
              {agency.description && (
                <p className="text-slate-600">{agency.description}</p>
              )}
            </div>
            <Link
              href="/"
              className="btn-secondary text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Agencies
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
            Available Vehicles
          </h2>
          <p className="text-slate-600">
            Choose from our selection of premium rental cars
          </p>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-semibold text-slate-900 mb-3">
              No vehicles available
            </h3>
            <p className="text-slate-600">Check back soon for new additions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle._id?.toString()}
                href={`/${params["agency-slug"]}/vehicles/${vehicle._id}`}
                className="group card-hover overflow-hidden"
              >
                <div className="relative h-56 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <Image
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="badge-success">Available</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {vehicle.color}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {vehicle.seats} seats
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {vehicle.transmission}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Starting from</p>
                      <p className="text-2xl font-display font-bold gradient-text">
                        ${vehicle.pricing.daily}
                        <span className="text-base font-normal text-slate-600">/day</span>
                      </p>
                    </div>
                    <span className="text-primary-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                      View Details
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
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


