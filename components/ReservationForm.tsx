"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ReservationFormProps {
  vehicleId: string;
  agencySlug: string;
  reservations: Array<{ startDate: Date; endDate: Date }>;
}

export default function ReservationForm({
  vehicleId,
  agencySlug,
  reservations,
}: ReservationFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    startDate: "",
    endDate: "",
    discountCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user && session.user.role === "client") {
      setFormData({
        ...formData,
        customerName: session.user.name || "",
        customerEmail: session.user.email || "",
      });
    }
  }, [session]);
  const [pricing, setPricing] = useState<{
    basePrice: number;
    discountAmount: number;
    totalPrice: number;
    totalDays: number;
  } | null>(null);

  const calculatePricing = async () => {
    if (!formData.startDate || !formData.endDate) {
      setPricing(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/pricing?startDate=${formData.startDate}&endDate=${formData.endDate}&discountCode=${formData.discountCode || ""}`
      );
      if (response.ok) {
        const data = await response.json();
        setPricing(data.pricing);
      }
    } catch (err) {
      console.error("Error calculating pricing:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create reservation");
        return;
      }

      router.push(`/${agencySlug}/reservations/${data._id}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show login prompt if not authenticated
  if (status === "loading") {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!session || session.user.role !== "client") {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Sign In to Book
        </h2>
        <p className="text-gray-600 mb-4">
          You need to be signed in as a client to make a reservation.
        </p>
        <div className="flex gap-3">
          <Link
            href="/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Make a Reservation
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            required
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.customerEmail}
            onChange={(e) =>
              setFormData({ ...formData, customerEmail: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            required
            value={formData.customerPhone}
            onChange={(e) =>
              setFormData({ ...formData, customerPhone: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={async (e) => {
                setFormData({ ...formData, startDate: e.target.value });
                await calculatePricing();
              }}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={async (e) => {
                setFormData({ ...formData, endDate: e.target.value });
                await calculatePricing();
              }}
              min={formData.startDate || new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Code (optional)
          </label>
          <input
            type="text"
            value={formData.discountCode}
            onChange={async (e) => {
              setFormData({ ...formData, discountCode: e.target.value });
              await calculatePricing();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {pricing && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price ({pricing.totalDays} days):</span>
                <span className="font-medium">${pricing.basePrice.toFixed(2)}</span>
              </div>
              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${pricing.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-blue-600">${pricing.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !pricing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Reserve Now"}
        </button>
      </form>
    </div>
  );
}

