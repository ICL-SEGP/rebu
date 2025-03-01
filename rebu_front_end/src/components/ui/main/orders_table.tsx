"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/tables/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/modals/dialog";
import { Slider } from "@/components/ui/shadcn/slider";
import { Badge } from "@/components/ui/helpers/badge";


const statusOptions = {
  "Refunded": { position: 0, color: "text-red-500", label: "Tokens Cancelled" },
  "In Progress": { position: 50, color: "text-orange-500", label: "Tokens in Escrow" },
  "Completed": { position: 100, color: "text-green-500", label: "Tokens Released" },
};

interface Order {
  id: number;
  status: string;
  date: string;
  totalRebateAmount: number; // ✅ Matches parseFloat()
}

const defaultStatus = { position: 50, color: "text-gray-500", label: "Unknown Status" };

const orders = [
  { id: 1, status: "In Progress", date: "2025-02-06", totalRebateAmount: "62.39" },
  { id: 2, status: "Completed", date: "2025-02-08", totalRebateAmount: "159.23" },
  { id: 3, status: "Refunded", date: "2025-02-10", totalRebateAmount: "179.38" },
];

const getSliderColorClass = (order) => {
  if (order.status === 'Completed') {
    return 'bg-green-500';
  } else if (order.status === 'Refunded') {
    return 'bg-red-500';
  } else {
    return 'bg-orange-500';
  }
};

export default function OrderTable({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Group orders by status
  const inProgressOrders = orders.filter(order => order.status === "In_progress");
  const refundedOrders = orders.filter(order => order.status === "Refunded");
  const completedOrders = orders.filter(order => order.status === "Completed");

  return (
    <div className="space-y-8">
      {/* Completed Orders */}
      <OrderSection
        title="Completed Orders"
        orders={completedOrders}
        borderColor="border-green-500"
        setSelectedOrder={setSelectedOrder}
        selectedOrder={selectedOrder}
      />

      {/* In-Progress Orders */}
      <OrderSection
        title="In-Progress Orders"
        orders={inProgressOrders}
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
function OrderSection({ title, orders, borderColor, setSelectedOrder, selectedOrder }) {
  if (orders.length === 0) return null;

  return (
    <div className={`border-2 ${borderColor} rounded-lg shadow-lg bg-white p-4`}>
      <h2 className="text-2xl font-semibold text-center mb-4">{title}</h2>
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[150px] px-4 py-3">Order ID</TableHead>
            <TableHead className="px-4 py-3">Date</TableHead>
            <TableHead className="px-4 py-3">Order Status</TableHead>
            <TableHead className="text-right px-4 py-3">Tokens Earned</TableHead>
            <TableHead className="px-4 py-3 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-gray-50 transition">
              <TableCell className="font-medium px-4 py-2">{order.id}</TableCell>
              <TableCell className="px-4 py-2">{order.date}</TableCell>
              <TableCell className="px-4 py-2 font-semibold">
                <Badge variant="outline">{order.status.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell className="text-right px-4 py-2">{order.totalRebateAmount}</TableCell>
              <TableCell className="text-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setSelectedOrder(order)}>Show Details</Button>
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
function OrderDetails({ order }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">Order ID: {order.id}</p>
      <p>Date: {order.date}</p>
      <p className="flex items-center gap-2">
        Status:
        <Badge variant="outline">{order.status.replace("_", " ")}</Badge>
      </p>

      {/* Status Slider */}
      <div className="relative w-full pt-6">
        <p className="text-lg font-semibold text-center">Order Progress</p>
        <Slider className="[&>.range-track]:bg-red-500 [&>.range-thumb]:bg-red-700"  value={[order.status === "Completed" ? 100 : order.status === "Refunded" ? 0 : 50]} min={0} max={100} step={25} disabled></Slider>
      </div>

      {/* Offers Section */}
      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold text-center">Offers Purchased</h3>
        {order.offers?.length > 0 ? (
          order.offers.map((offer, index) => (
            <div key={index} className="border p-3 rounded-lg shadow-md bg-gray-100 my-2">
              <img src="/images/sales-image.jpg" alt="Offer" className="rounded-lg w-full h-32 object-cover mb-2" />
              <p className="text-lg font-semibold">{offer.desc}</p>
              <p>
                <span className="font-medium">Affiliate Link:</span>{" "}
                <a href={offer.affiliate_link} target="_blank" className="text-blue-500 underline">
                  {offer.affiliate_link}
                </a>
              </p>
              <p><span className="font-medium">Rebate Percentage:</span> {parseFloat(offer.rebate_percentage).toFixed(2)}%</p>
              <p><span className="font-medium">Offer Start:</span> {new Date(offer.offer_start).toLocaleString()}</p>
              <p><span className="font-medium">Offer End:</span> {new Date(offer.offer_end).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No offers linked to this order.</p>
        )}
      </div>
    </div>
  );
}