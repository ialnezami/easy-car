"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Discount {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minRentalDays?: number;
  maxRentalDays?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export default function PricingPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    minRentalDays: undefined as number | undefined,
    maxRentalDays: undefined as number | undefined,
    validFrom: "",
    validTo: "",
    isActive: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("/api/discounts");
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data);
      }
    } catch (err) {
      console.error("Error fetching discounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          validFrom: new Date(formData.validFrom),
          validTo: new Date(formData.validTo),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create discount");
        return;
      }

      setShowForm(false);
      setFormData({
        code: "",
        type: "percentage",
        value: 0,
        minRentalDays: undefined,
        maxRentalDays: undefined,
        validFrom: "",
        validTo: "",
        isActive: true,
      });
      fetchDiscounts();
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Pricing & Discounts
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Discount"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Create New Discount</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "percentage" | "fixed",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value * ({formData.type === "percentage" ? "%" : "$"})
              </label>
              <input
                type="number"
                required
                min="0"
                step={formData.type === "percentage" ? "1" : "0.01"}
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    value: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rental Days (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.minRentalDays || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minRentalDays: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rental Days (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxRentalDays || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxRentalDays: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From *
                </label>
                <input
                  type="date"
                  required
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid To *
                </label>
                <input
                  type="date"
                  required
                  value={formData.validTo}
                  onChange={(e) =>
                    setFormData({ ...formData, validTo: e.target.value })
                  }
                  min={formData.validFrom}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Discount
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-xl font-semibold p-6 border-b">Active Discounts</h3>
        {discounts.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No discounts created yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valid Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discounts.map((discount) => (
                <tr key={discount._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {discount.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {discount.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {discount.type === "percentage"
                      ? `${discount.value}%`
                      : `$${discount.value}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(discount.validFrom).toLocaleDateString()} -{" "}
                    {new Date(discount.validTo).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        discount.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {discount.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

