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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{session.user.email}</span>
              <Link
                href="/api/auth/signout"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign Out
              </Link>
            </div>
          </div>
          <div className="flex gap-6 border-t">
            <Link
              href="/dashboard"
              className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
            >
              Vehicles
            </Link>
            <Link
              href="/dashboard/reservations"
              className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
            >
              Reservations
            </Link>
            <Link
              href="/dashboard/pricing"
              className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
            >
              Pricing & Discounts
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

