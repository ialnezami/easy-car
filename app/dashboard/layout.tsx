import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Redirect admin to admin dashboard
  if (session.user.role === "admin") {
    redirect("/admin");
  }

  // Only managers should access this dashboard
  if (session.user.role !== "manager" || !session.user.agencyId) {
    redirect("/client/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Navigation */}
      <nav className="glass border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white font-bold shadow-lg">
                EC
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-slate-900">Agency Dashboard</h1>
                <p className="text-xs text-slate-500">Manage Your Agency</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-semibold">
                  {session.user.name?.charAt(0).toUpperCase() || session.user.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{session.user.name || "Manager"}</p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                </div>
              </div>
              <Link
                href="/dashboard/profile"
                className="btn-secondary text-sm"
              >
                Profile
              </Link>
              <Link
                href="/api/auth/signout"
                className="btn-secondary text-sm"
              >
                Sign Out
              </Link>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-1 border-t border-slate-200/50">
            <Link
              href="/dashboard"
              className="px-6 py-4 text-sm font-semibold text-slate-700 border-b-2 border-transparent hover:text-primary-600 hover:border-primary-500 transition-colors relative"
            >
              Vehicles
            </Link>
            <Link
              href="/dashboard/reservations"
              className="px-6 py-4 text-sm font-semibold text-slate-700 border-b-2 border-transparent hover:text-primary-600 hover:border-primary-500 transition-colors relative"
            >
              Reservations
            </Link>
            <Link
              href="/dashboard/pricing"
              className="px-6 py-4 text-sm font-semibold text-slate-700 border-b-2 border-transparent hover:text-primary-600 hover:border-primary-500 transition-colors relative"
            >
              Pricing & Discounts
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

