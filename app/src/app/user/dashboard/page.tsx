"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

export default function DashboardPage() {
  // Hardcoded key metrics data
  const stats = {
    totalUsers: 150,
    totalRevenue: 23400, 
    activeOffers: 12,
    completedOrders: 50, // completed/refunded orders
  };

  // Dummy data 
  const data = [
    { month: "January", revenue: 3000 },
    { month: "February", revenue: 5000 },
    { month: "March", revenue: 4000 },
    { month: "April", revenue: 6000 },
    { month: "May", revenue: 5500 },
    { month: "June", revenue: 7000 },
  ];

  const chartConfig = {
    revenue: {
      label: "Sales Revenue",
      color: "rgb(54, 162, 235)",
    },
  };

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">Dashboard with Key Metrics</h1>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              ${stats.totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Active Offers */}
        <Card>
          <CardHeader>
            <CardTitle>Active Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.activeOffers}</p>
          </CardContent>
        </Card>

        {/* Completed/Refunded Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Completed/Refunded Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.completedOrders}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ChartContainer config={chartConfig} id="sales-trends">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideIndicator
                    hideLabel={false}
                  />
                }
              />
              <Bar dataKey="revenue" fill="rgb(54, 162, 235)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
