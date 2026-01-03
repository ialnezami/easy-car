"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ManagerProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agencyName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((profileData) => {
        if (profileData.error) {
          setError(profileData.error);
        } else {
          // Fetch agency name if agencyId exists
          let agencyNamePromise = Promise.resolve("");
          if (profileData.agencyId) {
            agencyNamePromise = fetch("/api/admin/agencies")
              .then((res) => res.json())
              .then((agencies: any[]) => {
                // Match agency by comparing string representations of ObjectIds
                const agency = agencies.find((a: any) => {
                  const agencyIdStr = typeof a._id === 'string' ? a._id : a._id?.toString();
                  const profileAgencyIdStr = typeof profileData.agencyId === 'string' 
                    ? profileData.agencyId 
                    : profileData.agencyId?.toString();
                  return agencyIdStr === profileAgencyIdStr;
                });
                return agency?.name || "";
              })
              .catch(() => "");
          }

          agencyNamePromise.then((agencyName) => {
            setFormData({
              name: profileData.name || "",
              email: profileData.email || "",
              phone: profileData.phone || "",
              password: "",
              confirmPassword: "",
              agencyName: agencyName,
            });
            setLoading(false);
          });
        }
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully!");
      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
      });
      
      await update();
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card p-8">
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Profile Settings</h2>

        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-xl mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {formData.name.charAt(0).toUpperCase() || formData.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{formData.name || "Manager"}</h3>
              <p className="text-sm text-slate-600">{formData.email}</p>
              <p className="text-xs text-slate-500 mt-1">Profile picture is based on your initials</p>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  placeholder="Leave blank to keep current password"
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
              </div>

              {formData.password && (
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Account Type:</span>
                <span className="font-semibold text-slate-900">Manager</span>
              </div>
              {formData.agencyName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Agency:</span>
                  <span className="font-semibold text-slate-900">{formData.agencyName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

