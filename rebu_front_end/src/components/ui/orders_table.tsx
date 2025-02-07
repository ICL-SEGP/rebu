"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";


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

export default function OrderTable({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (

    <Table className="w-full border rounded-lg shadow-md">
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead className="w-[150px] px-4 py-3">Order Id</TableHead>
          <TableHead className="px-4 py-3">Date</TableHead>
          <TableHead className="px-4 py-3">Order Status</TableHead>
          <TableHead className="text-right px-4 py-3">Tokens Earned</TableHead>
          <TableHead className="px-4 py-3 text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const statusInfo = statusOptions[order.status] || defaultStatus;
          return (
            <TableRow key={order.id} className="hover:bg-gray-50 transition">
              <TableCell className="font-medium px-4 py-2">{order.id}</TableCell>
              <TableCell className="px-4 py-2">{order.date}</TableCell>
              <TableCell className={`px-4 py-2 font-semibold ${statusInfo.color}`}>
                {order.status}
              </TableCell>
              <TableCell className="text-right px-4 py-2">{order.totalRebateAmount}</TableCell>
              <TableCell className="text-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setSelectedOrder(order)}>Show Details</Button>
                  </DialogTrigger>
                  {selectedOrder && (
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Order Info */}
                        <p className="text-lg font-semibold">Order ID: {selectedOrder.id}</p>
                        <p>Date: {selectedOrder.date}</p>
                        <p className="flex items-center gap-2">
                          Status:
                          <Badge className={statusInfo.color}>{selectedOrder.status}</Badge>
                        </p>

                        {/* Status Slider */}
                        <div className="relative w-full pt-6">
                          <p className="text-lg font-semibold text-center">{statusInfo.label}</p>
                          <Slider
                            value={[statusInfo.position]}
                            min={0}
                            max={100}
                            step={50}
                            disabled
                            className={statusInfo.color}
                          />
                        </div>

                        {/* Offers Section */}
                        <div className="border-t pt-4">
                          <h3 className="text-xl font-semibold text-center">Offers Purchased</h3>
                          {selectedOrder.offers?.length > 0 ? (
                            selectedOrder.offers.map((offer, index) => (
                              <div key={index} className="border p-3 rounded-lg shadow-md bg-gray-100 my-2">
                                {/* Offer Image */}
                                <img
                                  src="/images/sales-image.jpg"

                                  alt="Placeholder Image"
                                  className="rounded-lg"
                                />
                                {/* Offer Details */}
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
                    </DialogContent>
                  )}
                </Dialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>

  );
}
