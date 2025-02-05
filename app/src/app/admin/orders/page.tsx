"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

// Define Order type
interface Order {
  id: number;
  user: string;
  offer: string;
  amount: string;
  status: "Pending" | "Completed" | "Refunded";
  date: string;
}

// Hardcoded orders data
const initialOrders: Order[] = [
  { id: 1, user: "John Doe", offer: "50% Off Electronics", amount: "$200", status: "Pending", date: "2024-02-01" },
  { id: 2, user: "Jane Smith", offer: "20% Cashback on Clothing", amount: "$50", status: "Completed", date: "2024-01-28" },
  { id: 3, user: "Alice Johnson", offer: "15% Off Accessories", amount: "$75", status: "Refunded", date: "2024-01-25" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed" | "Refunded">("All");

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter
  const handleFilterStatus = (status: "All" | "Pending" | "Completed" | "Refunded") => {
    setStatusFilter(status);
  };

  // Handle updating order status
  const handleUpdateStatus = (id: number, newStatus: "Pending" | "Completed" | "Refunded") => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );
  };

  // Handle deleting order
  const handleDeleteOrder = (id: number) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  // Filtered orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.offer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Manage Orders</h1>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by user or offer..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/3"
        />

        <Select value={statusFilter} onValueChange={(value) => handleFilterStatus(value as "All" | "Pending" | "Completed" | "Refunded")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.user}</TableCell>
                  <TableCell>{order.offer}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleUpdateStatus(order.id, value as "Pending" | "Completed" | "Refunded")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteOrder(order.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
