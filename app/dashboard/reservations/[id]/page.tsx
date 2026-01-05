import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getReservationsCollection,
  getVehiclesCollection,
} from "@/lib/db/models";
import { ObjectId } from "mongodb";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

export default async function ReservationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  // Only managers can access this page
  if (!session || session.user.role !== "manager" || !session.user.agencyId) {
    redirect("/auth/signin");
  }

  const reservationsCollection = await getReservationsCollection();
  const reservation = await reservationsCollection.findOne({
    _id: new ObjectId(params.id),
    agencyId: new ObjectId(session.user.agencyId),
  });

  if (!reservation) {
    notFound();
  }

  const vehiclesCollection = await getVehiclesCollection();
  const vehicle = await vehiclesCollection.findOne({
    _id: reservation.vehicleId,
  });

  const isPdf = (url: string) => url.toLowerCase().endsWith(".pdf") || url.includes("pdf");

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/reservations"
          className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Reservations
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
          Reservation Details
        </h2>
        <p className="text-slate-600">
          View customer information and uploaded documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reservation Information */}
          <div className="card p-6">
            <h3 className="text-xl font-display font-semibold text-slate-900 mb-4">
              Reservation Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-600">Vehicle</label>
                <p className="text-lg font-semibold text-slate-900">
                  {vehicle
                    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                    : "Unknown"}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Status</label>
                <div className="mt-1">
                  {reservation.status === "confirmed" ? (
                    <span className="badge-success">Confirmed</span>
                  ) : reservation.status === "pending" ? (
                    <span className="badge-warning">Pending</span>
                  ) : reservation.status === "cancelled" ? (
                    <span className="badge-error">Cancelled</span>
                  ) : (
                    <span className="badge-info">Completed</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Start Date</label>
                <p className="text-slate-900">
                  {format(new Date(reservation.startDate), "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">End Date</label>
                <p className="text-slate-900">
                  {format(new Date(reservation.endDate), "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Duration</label>
                <p className="text-slate-900">
                  {reservation.totalDays} day{reservation.totalDays !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Total Price</label>
                <p className="text-2xl font-display font-bold text-primary-600">
                  ${reservation.totalPrice.toFixed(2)}
                </p>
                {reservation.discountAmount > 0 && (
                  <p className="text-sm text-success-600 mt-1">
                    Discount: ${reservation.discountAmount.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="card p-6">
            <h3 className="text-xl font-display font-semibold text-slate-900 mb-4">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-600">Name</label>
                <p className="text-slate-900">{reservation.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Email</label>
                <p className="text-slate-900">
                  <a href={`mailto:${reservation.customerEmail}`} className="text-primary-600 hover:text-primary-700">
                    {reservation.customerEmail}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Phone</label>
                <p className="text-slate-900">
                  <a href={`tel:${reservation.customerPhone}`} className="text-primary-600 hover:text-primary-700">
                    {reservation.customerPhone}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="card p-6">
            <h3 className="text-xl font-display font-semibold text-slate-900 mb-4">
              Uploaded Documents
            </h3>
            
            {!reservation.driverLicenseUrl && !reservation.idDocumentUrl ? (
              <div className="text-center py-8 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No documents uploaded</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservation.driverLicenseUrl && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {isPdf(reservation.driverLicenseUrl) ? (
                          <div className="w-10 h-10 rounded-lg bg-error-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">Driver's License</p>
                          <p className="text-sm text-slate-500">Required document</p>
                        </div>
                      </div>
                      <a
                        href={reservation.driverLicenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm"
                      >
                        View Document
                      </a>
                    </div>
                    {!isPdf(reservation.driverLicenseUrl) && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                        <Image
                          src={reservation.driverLicenseUrl}
                          alt="Driver's License"
                          width={600}
                          height={400}
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                )}

                {reservation.idDocumentUrl && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {isPdf(reservation.idDocumentUrl) ? (
                          <div className="w-10 h-10 rounded-lg bg-error-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">ID Document</p>
                          <p className="text-sm text-slate-500">Additional identification</p>
                        </div>
                      </div>
                      <a
                        href={reservation.idDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm"
                      >
                        View Document
                      </a>
                    </div>
                    {!isPdf(reservation.idDocumentUrl) && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                        <Image
                          src={reservation.idDocumentUrl}
                          alt="ID Document"
                          width={600}
                          height={400}
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-display font-semibold text-slate-900 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              {reservation.status === "pending" && (
                <>
                  <form
                    action={`/api/reservations/${reservation._id}`}
                    method="PATCH"
                  >
                    <input type="hidden" name="status" value="confirmed" />
                    <button type="submit" className="w-full btn-success">
                      Confirm Reservation
                    </button>
                  </form>
                  <form
                    action={`/api/reservations/${reservation._id}`}
                    method="PATCH"
                  >
                    <input type="hidden" name="status" value="cancelled" />
                    <button type="submit" className="w-full btn-danger">
                      Reject Reservation
                    </button>
                  </form>
                </>
              )}
              {reservation.status === "confirmed" && (
                <form
                  action={`/api/reservations/${reservation._id}`}
                  method="PATCH"
                >
                  <input type="hidden" name="status" value="completed" />
                  <button type="submit" className="w-full btn-secondary">
                    Mark as Completed
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-display font-semibold text-slate-900 mb-4">
              Reservation Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Base Price:</span>
                <span className="font-semibold">${reservation.basePrice.toFixed(2)}</span>
              </div>
              {reservation.discountAmount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>Discount:</span>
                  <span>-${reservation.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary-600">${reservation.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

