"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { fetchDashboardData } from "@/lib/api/admin"; // API function

// Define TypeScript types
interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  activeOffers: number;
  completedOrders: number;
}

interface ChartData {
  month: string;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { stats, salesTrends } = await fetchDashboardData();
        setStats(stats);
        setChartData(salesTrends);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // Show Skeletons While Loading
          Array(4)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
        ) : stats ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stats.totalUsers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">${stats.totalRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stats.activeOffers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed/Refunded Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stats.completedOrders}</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Sales Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : (
            <ChartContainer config={{ revenue: { label: "Sales Revenue", color: "rgb(54, 162, 235)" } }} id="sales-trends">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent hideIndicator hideLabel={false} />} />
                <Bar dataKey="revenue" fill="rgb(54, 162, 235)" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
