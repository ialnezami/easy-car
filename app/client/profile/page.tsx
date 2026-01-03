"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ClientProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            password: "",
            confirmPassword: "",
          });
        }
        setLoading(false);
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
      
      // Update session
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Navigation */}
      <nav className="glass border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/client/dashboard" className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white font-bold shadow-lg">
                EC
              </Link>
              <div>
                <h1 className="text-xl font-display font-bold text-slate-900">My Profile</h1>
                <p className="text-xs text-slate-500">Manage your account</p>
              </div>
            </div>
            <Link href="/client/dashboard" className="btn-secondary text-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
                  <h3 className="text-lg font-semibold text-slate-900">{formData.name || "User"}</h3>
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
                      placeholder="John Doe"
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
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                      placeholder="+1-555-0101"
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
                        placeholder="Confirm your new password"
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
                    <span className="font-semibold text-slate-900">Client</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Member Since:</span>
                    <span className="font-semibold text-slate-900">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
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
                  href="/client/dashboard"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

