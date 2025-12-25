"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewVehiclePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    licensePlate: "",
    images: [] as string[],
    features: [] as string[],
    seats: 5,
    transmission: "automatic" as "manual" | "automatic",
    fuelType: "gasoline" as "gasoline" | "diesel" | "electric" | "hybrid",
    pricing: {
      daily: 0,
      weekly: 0,
      monthly: 0,
    },
    isAvailable: true,
  });
  const [imageUrl, setImageUrl] = useState("");
  const [feature, setFeature] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create vehicle");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl],
      });
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addFeature = () => {
    if (feature && !formData.features.includes(feature)) {
      setFormData({
        ...formData,
        features: [...formData.features, feature],
      });
      setFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Vehicles
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-6">Add New Vehicle</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make *
            </label>
            <input
              type="text"
              required
              value={formData.make}
              onChange={(e) =>
                setFormData({ ...formData, make: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              required
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color *
            </label>
            <input
              type="text"
              required
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Plate *
            </label>
            <input
              type="text"
              required
              value={formData.licensePlate}
              onChange={(e) =>
                setFormData({ ...formData, licensePlate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seats *
            </label>
            <input
              type="number"
              required
              min="1"
              max="50"
              value={formData.seats}
              onChange={(e) =>
                setFormData({ ...formData, seats: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmission *
            </label>
            <select
              value={formData.transmission}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  transmission: e.target.value as "manual" | "automatic",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type *
            </label>
            <select
              value={formData.fuelType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fuelType: e.target.value as
                    | "gasoline"
                    | "diesel"
                    | "electric"
                    | "hybrid",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pricing *
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Daily"
                value={formData.pricing.daily || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      daily: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Weekly"
                value={formData.pricing.weekly || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      weekly: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Monthly"
                value={formData.pricing.monthly || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      monthly: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`Vehicle ${index + 1}`}
                  className="h-20 w-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Features
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="Feature name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feat, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
              >
                {feat}
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={(e) =>
              setFormData({ ...formData, isAvailable: e.target.checked })
            }
            className="mr-2"
          />
          <label htmlFor="isAvailable" className="text-sm text-gray-700">
            Available for rental
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Vehicle"}
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

