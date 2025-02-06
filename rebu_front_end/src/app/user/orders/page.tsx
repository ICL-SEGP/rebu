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

// Define the structure of an order (TypeScript type safety)
interface Invoice {
  invoice: string;
  paymentStatus: "Paid" | "Pending" | "Unpaid";
  totalAmount: string; // e.g., "$250.00"
  paymentMethod: string;
}

// Backend API endpoint (Replace with your actual API)
const API_URL = "/api/orders";

export default function OrdersPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch orders from the backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) return Error("Failed to fetch orders");

      const data: Invoice[] = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
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
      <Table className="w-full border rounded-lg shadow-md">
        <TableCaption>A list of recent orders</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[150px] px-4 py-3">Invoice</TableHead>
            <TableHead className="px-4 py-3">Status</TableHead>
            <TableHead className="px-4 py-3">Method</TableHead>
            <TableHead className="text-right px-4 py-3">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                Loading orders...
              </TableCell>
            </TableRow>
          ) : invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.invoice} className="hover:bg-gray-50 transition">
                <TableCell className="font-medium px-4 py-2">{invoice.invoice}</TableCell>
                <TableCell className="px-4 py-2">
                  <Badge
                    className={`px-3 py-1 text-sm font-semibold ${
                      invoice.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-700"
                        : invoice.paymentStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {invoice.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-2">{invoice.paymentMethod}</TableCell>
                <TableCell className="text-right px-4 py-2">{invoice.totalAmount}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                No orders available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="px-4 py-3 font-semibold">Total</TableCell>
            <TableCell className="text-right px-4 py-3 font-semibold">
              {invoices
                .reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount.replace("$", "")), 0)
                .toFixed(2) || "$0.00"}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
