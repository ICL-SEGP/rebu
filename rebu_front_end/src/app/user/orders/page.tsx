"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/constants";
import OrderTable from "@/components/ui/orders_table";

// Define the structure of an order (TypeScript type safety)
interface Invoice {
  invoice: string;
  paymentStatus: "Paid" | "Pending" | "Unpaid";
  totalAmount: string; // e.g., "$250.00"
  paymentMethod: string;
}

interface Order {
  id: number;
  status: string;
  date: string;
  totalRebateAmount: number; // ✅ Matches parseFloat()
}

// Backend API endpoint (Replace with your actual API)
const API_URL = "/api/orders";

export default function OrdersPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const { data: session } = useSession();


  // Fetch orders from the backend
  const fetchOrders = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch balance");

      const orders = (await res.json()).orders;

      let fetchedOrders: Order[] = await orders.map((order) => ({
        id: order.id,
        status: order.status,
        date: order.inserted_at, // Renaming inserted_at to date
        totalRebateAmount: parseFloat(order.total_rebate_amount).toFixed(2),
        offers: order.offers // Convert to number
      }))


      setOrders(fetchedOrders);


    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };


  // Fetch orders on mount and refresh every 5 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (


    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <OrderTable orders={orders}/>

    </div>
  );
}
