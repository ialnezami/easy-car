"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewUserPage() {
  const router = useRouter();
  const [agencies, setAgencies] = useState<Array<{ _id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "client" as "admin" | "manager" | "client",
    agencyId: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(true);

  useEffect(() => {
    fetch("/api/admin/agencies")
      .then((res) => res.json())
      .then((data) => {
        setAgencies(data);
        setLoadingAgencies(false);
      })
      .catch(() => setLoadingAgencies(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || undefined,
      };

      if (formData.role === "manager" && formData.agencyId) {
        payload.agencyId = formData.agencyId;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create user");
        return;
      }

      router.push("/admin/users");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/users" className="text-primary-600 hover:text-primary-700">
          ← Back to Users
        </Link>
      </div>

      <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">Create New User</h2>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="label">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="label">Password *</label>
          <input
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="input"
            placeholder="Minimum 6 characters"
          />
        </div>

        <div>
          <label className="label">Role *</label>
          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as "admin" | "manager" | "client",
                agencyId: e.target.value !== "manager" ? "" : formData.agencyId,
              })
            }
            className="input"
          >
            <option value="client">Client</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {formData.role === "manager" && (
          <div>
            <label className="label">Agency *</label>
            {loadingAgencies ? (
              <div className="input">Loading agencies...</div>
            ) : (
              <select
                required
                value={formData.agencyId}
                onChange={(e) => setFormData({ ...formData, agencyId: e.target.value })}
                className="input"
              >
                <option value="">Select an agency</option>
                {agencies.map((agency) => (
                  <option key={agency._id} value={agency._id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="label">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input"
            placeholder="+1-555-0101"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

