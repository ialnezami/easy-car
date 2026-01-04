"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

interface AnalyticsData {
  overview: {
    totalAgencies: number;
    totalUsers: number;
    totalVehicles: number;
    totalReservations: number;
    totalManagers: number;
    totalClients: number;
    availableVehicles: number;
    unavailableVehicles: number;
    newUsers: number;
  };
  revenue: {
    totalRevenue: number;
    totalDiscounts: number;
    averageReservationValue: number;
    period: number;
  };
  reservations: {
    byStatus: {
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
    };
    recent: Array<{
      id: string;
      customerName: string;
      totalPrice: number;
      status: string;
      createdAt: string;
    }>;
  };
  agencyPerformance: Array<{
    agencyId: string;
    agencyName: string;
    reservationCount: number;
    revenue: number;
    vehicleCount: number;
  }>;
  popularVehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    reservationCount: number;
    totalRevenue: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?days=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const analyticsData = await response.json();
      setData(analyticsData);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="text-error-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Analytics</h3>
        <p className="text-slate-600">{error}</p>
        <button onClick={fetchAnalytics} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
            System Analytics
          </h2>
          <p className="text-slate-600">
            Comprehensive insights into platform performance and usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="input text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Total Revenue</h3>
          <p className="text-3xl font-display font-bold text-slate-900">
            ${data.revenue.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Last {period} days</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Total Reservations</h3>
          <p className="text-3xl font-display font-bold text-slate-900">{data.overview.totalReservations}</p>
          <p className="text-xs text-slate-500 mt-1">All time</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Total Users</h3>
          <p className="text-3xl font-display font-bold text-slate-900">{data.overview.totalUsers}</p>
          <p className="text-xs text-slate-500 mt-1">
            {data.overview.totalManagers} managers, {data.overview.totalClients} clients
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Average Order Value</h3>
          <p className="text-3xl font-display font-bold text-slate-900">
            ${data.revenue.averageReservationValue.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Per reservation</p>
        </div>
      </div>

      {/* Revenue & Reservations Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Breakdown */}
        <div className="card p-6">
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Revenue</span>
              <span className="text-lg font-bold text-slate-900">
                ${data.revenue.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Discounts Applied</span>
              <span className="text-lg font-semibold text-slate-700">
                -${data.revenue.totalDiscounts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Net Revenue</span>
                <span className="text-xl font-bold text-primary-600">
                  ${(data.revenue.totalRevenue - data.revenue.totalDiscounts).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Status */}
        <div className="card p-6">
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-4">Reservations by Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge-warning">Pending</span>
              </div>
              <span className="font-semibold text-slate-900">{data.reservations.byStatus.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge-success">Confirmed</span>
              </div>
              <span className="font-semibold text-slate-900">{data.reservations.byStatus.confirmed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge-info">Completed</span>
              </div>
              <span className="font-semibold text-slate-900">{data.reservations.byStatus.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge-error">Cancelled</span>
              </div>
              <span className="font-semibold text-slate-900">{data.reservations.byStatus.cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agency Performance */}
      <div className="card p-6 mb-8">
        <h3 className="text-xl font-display font-semibold text-slate-900 mb-4">Agency Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Agency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Vehicles</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Reservations</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {data.agencyPerformance.map((agency) => (
                <tr key={agency.agencyId} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                    {agency.agencyName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {agency.vehicleCount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {agency.reservationCount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                    ${agency.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Vehicles & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Vehicles */}
        <div className="card p-6">
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-4">Most Popular Vehicles</h3>
          {data.popularVehicles.length === 0 ? (
            <p className="text-slate-600 text-sm">No reservations yet</p>
          ) : (
            <div className="space-y-3">
              {data.popularVehicles.map((vehicle, index) => (
                <div key={vehicle.vehicleId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{vehicle.vehicleName}</p>
                      <p className="text-xs text-slate-600">{vehicle.reservationCount} reservations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">${vehicle.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-4">Recent Reservations</h3>
          {data.reservations.recent.length === 0 ? (
            <p className="text-slate-600 text-sm">No recent reservations</p>
          ) : (
            <div className="space-y-3">
              {data.reservations.recent.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{reservation.customerName}</p>
                    <p className="text-xs text-slate-600">
                      {format(new Date(reservation.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">${reservation.totalPrice.toFixed(2)}</p>
                    {reservation.status === "confirmed" ? (
                      <span className="badge-success text-xs">Confirmed</span>
                    ) : reservation.status === "pending" ? (
                      <span className="badge-warning text-xs">Pending</span>
                    ) : (
                      <span className="badge-info text-xs">{reservation.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

