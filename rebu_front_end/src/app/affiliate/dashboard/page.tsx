"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/helpers/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/charts/chart";
// import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { API_BASE_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/tables/table";
import { Button } from "@/components/ui/helpers/button";
import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import SalesDashboard from "@/components/ui/main/monthlyBreakdown";
import { stat } from "fs";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Pie, Line } from "react-chartjs-2"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/helpers/alert";


ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
)

export default function DashboardPage() {
  // Hardcoded key metrics data

  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const { data: session } = useSession();
  const router = useRouter();
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [orders, setOrders] = useState<Order[]>([]);



  if (!session) {
    throw new Error("No user logged in.");
  }

  const fetchOrders = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/affiliate/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const orders = (await res.json());

      console.log(orders)

      let fetchedOrders = await orders.map((order) => ({
        id: order.id,
        status: order.status,
        date: order.inserted_at, // Renaming inserted_at to date
        totalRebateAmount: parseFloat(order.total_rebate_amount).toFixed(2), // Convert to number
      }))


      setOrders(fetchedOrders.slice(0, 3));


    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchUsers = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/affiliate/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const users = (await res.json()).users;

      // let fetchedOrders: Order[] = await orders.map((order) => ({
      //   id: order.id,
      //   status: order.status,
      //   date: order.inserted_at, // Renaming inserted_at to date
      //   totalRebateAmount: parseFloat(order.total_rebate_amount).toFixed(2), // Convert to number
      // }))

      setUsers(users.slice(0, 3));
      setTotalUsers(users.length)


    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStats = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/affiliate/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch stats");

      const stats = (await res.json());

      // let fetchedOrders: Order[] = await orders.map((order) => ({
      //   id: order.id,
      //   status: order.status,
      //   date: order.inserted_at, // Renaming inserted_at to date
      //   totalRebateAmount: parseFloat(order.total_rebate_amount).toFixed(2), // Convert to number
      // }))

      setStats(stats)

      console.log("stats", stats)
      setMonthlyBreakdown(
        Object.entries(stats.monthly_breakdown).map(([key, value]) => {
          return {
            monthName: value.month.trim(),
            completedOrders: value.completed_orders,
            refundedOrders: value.refunded_orders,
            rebateCompleted: parseFloat(value.total_tokens_rebate_completed).toFixed(2),
            tokensRefunded: parseFloat(value.total_rescinded_tokens).toFixed(2),
          }
        })
      );

      console.log(stats)

    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchOrders();
  }, [])

  const numericBreakdown = monthlyBreakdown.map((item) => ({
    ...item,
    // Ensure these fields are numbers
    rebateCompleted: parseFloat(item.rebateCompleted),
    tokensRefunded: parseFloat(item.tokensRefunded),
  }))
  const barData = {
    labels: numericBreakdown.map((d) => d.monthName), // x-axis
    datasets: [
      {
        label: "Completed Orders",
        data: numericBreakdown.map((d) => d.completedOrders),
        backgroundColor: "#66BB6A",
      },
      {
        label: "Refunded Orders",
        data: numericBreakdown.map((d) => d.refundedOrders),
        backgroundColor: "#EF5350",
      },
    ],
  }



  const s = {
    totalUsers: 150,
    totalRevenue: 23400,
    activeOffers: 12,
    completedOrders: 50, // completed/refunded orders
  };


  const chartConfig = {
    revenue: {
      label: "Sales Revenue",
      color: "rgb(54, 162, 235)",
    },
  };

  const [orderType, setOrderType] = useState("completed");


  // Determine chart data & color dynamically
  function changeOrderType() {
    if (orderType == "completed") {
      setOrderType("refunded")

    } else {
      setOrderType("completed")
    }
  }

  const chartColor = orderType === "completed" ? "rgb(54, 162, 235)" : "rgb(235, 54, 54)";

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>


      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalUsers}</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Total successful Rebates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold flex items-center gap-1">
              <Coins className="w-6 h-6" />
              {parseFloat(stats.balances?.tokens ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Active Offers */}
        <Card>
          <CardHeader>
            <CardTitle>Active Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.offer_counts?.active ?? 0}</p>
          </CardContent>
        </Card>

        {/* Completed/Refunded Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.order_counts?.completed ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trends Chart */}

      <Card>
        <CardHeader>
          <CardTitle>Sales Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Bar data={barData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardTitle>Recent Transactions</CardTitle>
            <Button onClick={() => router.push("/affiliate/orders")}> All Orders </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="w-full border rounded-lg shadow-md">
            <TableCaption>A list of recent user sales.</TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[150px] px-4 py-3">Order Id</TableHead>
                <TableHead className="px-4 py-3">Date</TableHead>
                <TableHead className="px-4 py-3">Order Status</TableHead>
                <TableHead className="text-right px-4 py-3">Token's Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition">
                  <TableCell className="font-medium px-4 py-2">{order.id}</TableCell>
                  <TableCell className="font-medium px-4 py-2">{order.date}</TableCell>
                  <TableCell className="px-4 py-2">{order.status}</TableCell>
                  <TableCell className="text-right px-4 py-2">{order.totalRebateAmount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SalesDashboard monthlyBreakdown={monthlyBreakdown}></SalesDashboard>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardTitle>Recent Transactions</CardTitle>
            <Button onClick={() => router.push("/affiliate/users")}> Users </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="w-full border rounded-lg shadow-md">
            <TableCaption>A list of your recent purchases</TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[150px] px-4 py-3">User Id</TableHead>
                <TableHead className="px-4 py-3">Name</TableHead>
                <TableHead className="px-4 py-3">Email</TableHead>
                <TableHead className="text-right px-4 py-3">Token's Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition">
                  <TableCell className="font-medium px-4 py-2">{user.id}</TableCell>
                  <TableCell className="font-medium px-4 py-2">{user.first_name + " " + user.last_name}</TableCell>
                  <TableCell className="px-4 py-2">{user.email}</TableCell>
                  <TableCell className="text-right px-4 py-2">{parseFloat(user.token_balance).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
