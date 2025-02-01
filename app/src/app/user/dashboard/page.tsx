"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"



export default function DashboardPage() {
  // Hardcoded key metrics data
  const stats = {
    availableTokens: 500,
    lockedTokens: 200,
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

  const products = [
    {
      date: "2025-01-10",
      product: "Product A",
      tokens: "100",
    },
    {
      date: "2025-01-08",
      product: "Product B",
      tokens: "400",
    },
    {
      date: "2025-01-07",
      product: "Product A",
      tokens: "100",
    },
    {
      date: "2025-01-01",
      product: "Product C",
      tokens: "300",
    },
  ]
  

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">Dashboard with Key Metrics</h1>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-500">Available Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.availableTokens}</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Locked Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.lockedTokens}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trends Chart */}
      
      <Card>
      <Table className="w-full">
        <TableCaption>A list of recent products</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead className="text-center">Product</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow>
              <TableCell className="font-medium">{product.date}</TableCell>
              <TableCell className="text-center">{product.product}</TableCell>
              <TableCell className="text-right">{product.tokens}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        {/* <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter> */}
      </Table>
      </Card>
    </div>
  );
}
