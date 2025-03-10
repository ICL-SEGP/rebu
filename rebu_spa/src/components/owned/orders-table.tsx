"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Order, Offer, OrderStatus } from "@/types/types";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function OrderTable({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>(
    OrderStatus.ALL
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const dateString = order.orderDate.toDateString().toLowerCase();
      const matchesSearch = dateString.includes(
        searchQuery.toLowerCase().trim()
      );

      const matchesStatus =
        statusFilter === OrderStatus.ALL || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const pendingOrders = useMemo(() => {
    return filteredOrders.filter(
      (order) => order.status === OrderStatus.PENDING
    );
  }, [filteredOrders]);

  const completedOrders = useMemo(() => {
    return filteredOrders.filter(
      (order) => order.status === OrderStatus.COMPLETED
    );
  }, [filteredOrders]);

  const refundedOrders = useMemo(() => {
    return filteredOrders.filter(
      (order) => order.status === OrderStatus.CANCELED
    );
  }, [filteredOrders]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Status Filter Handler
  const handleFilterStatus = (status: OrderStatus) => {
    setStatusFilter(status);
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <Input
          placeholder="Search by offer or date..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/3"
        />

        <Select
          value={statusFilter}
          onValueChange={(value) => handleFilterStatus(value as OrderStatus)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent defaultValue={"all"}>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Completed Orders */}
      <OrderSection
        title="Completed Orders"
        orders={completedOrders}
        borderColor="border-green-500"
        setSelectedOrder={setSelectedOrder}
        selectedOrder={selectedOrder}
      />

      {/* Pending Orders */}
      <OrderSection
        title="Pending Orders"
        orders={pendingOrders}
        borderColor="border-orange-500"
        setSelectedOrder={setSelectedOrder}
        selectedOrder={selectedOrder}
      />

      {/* Refunded Orders */}
      <OrderSection
        title="Refunded Orders"
        orders={refundedOrders}
        borderColor="border-red-500"
        setSelectedOrder={setSelectedOrder}
        selectedOrder={selectedOrder}
      />
    </div>
  );
}

// Order Section Component (Reusable for In-Progress, Refunded, and Completed Orders)
function OrderSection({
  title,
  orders,
  borderColor,
  setSelectedOrder,
  selectedOrder,
}: {
  title: string;
  orders: Order[];
  borderColor: string;
  setSelectedOrder: any;
  selectedOrder: Order | undefined;
}) {
  if (orders.length === 0) return null;

  return (
    <div
      className={`border-2 ${borderColor} rounded-lg shadow-lg bg-white p-4`}
    >
      <h2 className="text-2xl font-semibold text-center mb-4">{title}</h2>
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[150px] px-4 py-3">Order ID</TableHead>
            <TableHead className="px-4 py-3">Date</TableHead>
            <TableHead className="px-4 py-3">Order Status</TableHead>
            <TableHead className="text-right px-4 py-3">
              Tokens Earned
            </TableHead>
            <TableHead className="px-4 py-3 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order: Order) => (
            <TableRow key={order.id} className="hover:bg-gray-50 transition">
              <TableCell className="font-medium px-4 py-2">
                {order.id}
              </TableCell>
              <TableCell className="px-4 py-2">
                {order.orderDate.toDateString()}
              </TableCell>
              <TableCell className="px-4 py-2 font-semibold">
                <Badge variant="outline">{order.status}</Badge>
              </TableCell>
              <TableCell className="text-right px-4 py-2">
                {order.totalRebateAmount}
              </TableCell>
              <TableCell className="text-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setSelectedOrder(order)}>
                      Show Details
                    </Button>
                  </DialogTrigger>
                  {selectedOrder && selectedOrder.id === order.id && (
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                      </DialogHeader>
                      <OrderDetails order={selectedOrder} />
                    </DialogContent>
                  )}
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Order Details Component (Modal)
function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">Order ID: {order.id}</p>
      <p>Date: {order.orderDate.toDateString()}</p>
      <div className="flex items-center gap-2">
        Status:
        <Badge variant="outline">{order.status.replace("_", " ")}</Badge>
      </div>

      {/* Status Slider */}
      <div className="relative w-full pt-6">
        <p className="text-lg font-semibold text-center">Order Progress</p>
        <Slider
          className="[&>.range-track]:bg-red-500 [&>.range-thumb]:bg-red-700"
          value={[
            order.status === OrderStatus.COMPLETED
              ? 100
              : order.status === OrderStatus.CANCELED
              ? 0
              : 50,
          ]}
          min={0}
          max={100}
          step={25}
          disabled
        ></Slider>
      </div>

      {/* Offers Section */}
      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold text-center">Offers Purchased</h3>
        {order.offers?.length > 0 ? (
          order.offers.map((offer, index) => (
            <div
              key={index}
              className="border p-3 rounded-lg shadow-md bg-gray-100 my-2"
            >
              <img
                src="/images/sales-image.jpg"
                alt="Offer"
                className="rounded-lg w-full h-32 object-cover mb-2"
              />
              <p className="text-lg font-semibold">{offer.desc}</p>
              <p>
                <span className="font-medium">Affiliate Link:</span>{" "}
                <a
                  href={offer.affiliateLink}
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  {offer.affiliateLink}
                </a>
              </p>
              <p>
                <span className="font-medium">Rebate Percentage:</span>{" "}
                {offer.rebatePercentage}%
              </p>
              <p>
                <span className="font-medium">Offer Start:</span>{" "}
                {new Date(offer.offerStart).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Offer End:</span>{" "}
                {new Date(offer.offerEnd).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No offers linked to this order.
          </p>
        )}
      </div>
    </div>
  );
}
