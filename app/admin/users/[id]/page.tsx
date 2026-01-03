"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users/${userId}`).then((res) => res.json()),
      fetch("/api/admin/agencies").then((res) => res.json()),
    ])
      .then(([userData, agenciesData]) => {
        if (userData.error) {
          setError(userData.error);
        } else {
          setFormData({
            email: userData.email || "",
            password: "",
            name: userData.name || "",
            role: userData.role || "client",
            agencyId: userData.agencyId || "",
            phone: userData.phone || "",
          });
        }
        setAgencies(agenciesData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load user");
        setLoading(false);
      });
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || undefined,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (formData.role === "manager" && formData.agencyId) {
        payload.agencyId = formData.agencyId;
      } else if (formData.role !== "manager") {
        payload.agencyId = null;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update user");
        return;
      }

      router.push("/admin/users");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete user");
        return;
      }

      router.push("/admin/users");
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/users" className="text-primary-600 hover:text-primary-700">
          ← Back to Users
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-display font-bold text-slate-900">Edit User</h2>
        <button
          onClick={handleDelete}
          className="btn-danger text-sm"
        >
          Delete User
        </button>
      </div>

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
          />
        </div>

        <div>
          <label className="label">New Password (leave blank to keep current)</label>
          <input
            type="password"
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
          </div>
        )}

        <div>
          <label className="label">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 btn-primary"
          >
            {saving ? "Saving..." : "Save Changes"}
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

