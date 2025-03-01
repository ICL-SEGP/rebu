"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/constants";

import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/tables/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/forms/select";
import { Input } from "@/components/ui/forms/input";
import { Check, Pencil, Trash2 } from "lucide-react";
import TestPage from "@/components/ui/test";
import NewOrderForm from "@/components/ui/main/new-order-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/forms/popover";


// Hardcoded orders data
const initialOrders = [
  { id: 1, user: "John Doe", offers: [], amount: "$200", status: "Pending", date: "2024-02-01" },
  { id: 2, user: "Jane Smith", offers: [], amount: "$50", status: "Completed", date: "2024-01-28" },
  { id: 3, user: "Alice Johnson", offers: [], amount: "$75", status: "Refunded", date: "2024-01-25" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "in_progress" | "completed" | "refunded">("All");
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: session } = useSession();
  if (!session) throw new Error("No user logged in.");

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

      let fetchedOrders = await orders.map((order) => (
        {
          id: order.id,
          offers: order.offers.map((offer) => { return offer.id }),
          user: order.user?.email,
          date: order.date,
          status: order.status, // Renaming inserted_at to date
          amount: parseFloat(order.total_rebate_amount).toFixed(2), // Convert to number
        }))


      setOrders(fetchedOrders);


    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Search Handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Status Filter Handler
  const handleFilterStatus = (status: "All" | "in_progress" | "completed" | "refunded") => {
    setStatusFilter(status);
  };

  // Confirm Update Handler
  const handleConfirmUpdate = async (updatedOrder: Order) => {
    if (!window.confirm(`Are you sure you want to update Order #${updatedOrder.id}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedOrder),
      });

      if (!response.ok) throw new Error("Failed to update order.");
      alert("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order.");
    }
  };

  // Delete Order Handler
  const handleDeleteOrder = (id: number) => {
    if (window.confirm(`Are you sure you want to delete Order #${id}?`)) {
      setOrders(orders.filter((order) => order.id !== id));
    }
  };

  // Filter Orders Based on Search & Status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      console.log("filtered", order);

      let userEmail = "";
      if (order.user && typeof order.user.email === 'string') {
        userEmail = order.user.email.toLowerCase();
      }

      const amountAsString = String(order.amount).toLowerCase();

      const matchesSearch =
        userEmail.includes(searchQuery.toLowerCase()) ||
        amountAsString.includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);
  // Categorize Orders by Status
  const pendingOrders = useMemo(() => {
    return filteredOrders.filter((order) => order.status === "in_progress");
  }, [filteredOrders]);

  const completedOrders = useMemo(() => {
    return filteredOrders.filter((order) => order.status === "completed");
  }, [filteredOrders]);

  const refundedOrders = useMemo(() => {
    return filteredOrders.filter((order) => order.status === "refunded");
  }, [filteredOrders]);

  return (
    <div className="space-y-6 p-6l">
      <h1 className="text-2xl font-bold">Manage Orders</h1>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by user or offer..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/3"
        />

        <Select value={statusFilter} onValueChange={(value) => handleFilterStatus(value as "All" | "in_progress" | "completed" | "refunded")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="in_progress">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Sections */}
      {pendingOrders.length > 0 && (
        <OrderSection
          title="Pending Orders"
          editingId={editingId}
          setEditingId={setEditingId}
          orders={pendingOrders}
          borderColor="border-orange-500"
          setOrders={setOrders}
        />
      )}

      {completedOrders.length > 0 && (
        <OrderSection
          title="Completed Orders"
          editingId={editingId}
          setEditingId={setEditingId}
          orders={completedOrders}
          borderColor="border-green-500"
          setOrders={setOrders}
        />
      )}

      {refundedOrders.length > 0 && (
        <OrderSection
          title="Refunded Orders"
          editingId={editingId}
          setEditingId={setEditingId}
          orders={refundedOrders}
          borderColor="border-red-500"
          setOrders={setOrders}
        />
      )}

      <NewOrderForm setOrders={setOrders} />
    </div>
  );
}

function OrderSection({ title, orders, borderColor, editingId, setEditingId, setOrders }) {
  const { data: session } = useSession();
  if (!session) throw new Error("No user logged in.");
  const [offers, setOffers] = useState([]);

  const [tempOrder, setTempOrder] = useState<Order | null>(null);

  // Field Change Handler
  const handleFieldChange = (field: keyof Order, value: string) => {
    if (tempOrder) setTempOrder({ ...tempOrder, [field]: value });
  };

  // Edit Order
  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setTempOrder({ ...order }); // Store a temporary copy
    // TODO:
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setTempOrder(null);
  };

  // Save Order Update
  const handleSave = () => {
    if (!tempOrder) return;
    if (!window.confirm(`Are you sure you want to update Order #${tempOrder.id} ?`)) return;
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === tempOrder.id ? tempOrder : order)));
    setEditingId(null);
    handleConfirmUpdate(tempOrder);
  };
  // Delete Order
  const handleDeleteOrder = (id: number) => {
    if (window.confirm(`Are you sure you want to delete Order #${id}?`)) {

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== id)
      );
      deleteOrder(id);

    }
  };

  const deleteOrder = async (id) => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete order");

    } catch (error) {
      console.error("Error deleting orders:", error);
    }
  };



  const fetchOffers = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/offers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch balance");

      const offers = (await res.json()).data;

      let fetchedOffers = await offers.map((offer) => ({
        id: offer.id,
        desc: offer.desc,
        affiliate_link: offer.affiliate_link,
        offer_started: offer.offer_start,
        offer_end: offer.offer_end,
        rebate_percentage: parseFloat(offer.rebate_percentage).toFixed(2)
      }))


      setOffers(fetchedOffers);


    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };


  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (editingId) {
      const editingOrder = orders.find((order) => order.id === editingId);
      if (editingOrder) {
        setTempOrder(editingOrder); // Sync tempOrder with selected order
      }
    }
  }, [editingId, orders]);


  // Confirm Order Update
  const handleConfirmUpdate = async (updatedOrder: Order) => {

    try {
      const response = await fetch(`${API_BASE_URL}/api/affiliate/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(updatedOrder),
      });

      if (!response.ok) throw new Error("Failed to update order.");
      alert("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order.");
    }
  };

  return (
    <Card className={`border-2 ${borderColor} rounded-lg shadow-lg`}>
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>User</TableHead>
              <TableHead>Offer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {editingId === order.id ? (
                    <Input value={tempOrder?.user || ""} onChange={(e) => handleFieldChange("user", e.target.value)} />
                  ) : (
                    order.user
                  )}
                </TableCell>

                <TableCell>
                  {editingId === order.id ? (
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Select Offers:</label>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            {order.offers && order.offers.length > 0
                              ? `${order.offers.length} offer(s) selected`
                              : "Select Offers"}
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent align="start" className="w-auto p-2 bg-white border rounded-lg shadow-lg">
                          <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto p-2">
                            {offers.map((offer) => {
                              const editingOrder = orders.find((order) => order.id === editingId);
                              const isSelected = editingOrder?.offers?.some((o) => o.id === offer.id) || tempOrder?.offers?.includes(offer.id);

                              return (
                                <div
                                  key={offer.id}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                                  onClick={() => {
                                    setOrders((prevOrders) =>
                                      prevOrders.map((order) =>
                                        order.id === editingId
                                          ? { ...order, offers: isSelected ? order.offers.filter((id) => id !== offer.id) : [...order.offers, offer.id] }
                                          : order
                                      )
                                    );
                                    setTempOrder((prev) => ({
                                      ...prev,
                                      offers: isSelected
                                        ? prev.offers.filter((id) => id !== offer.id) // Remove if already selected
                                        : [...prev.offers, offer.id], // Append to the end of the array
                                    }));
                                  }}
                                >
                                  {/* Checkbox UI */}
                                  <div
                                    className={`w-5 h-5 border rounded-md flex items-center justify-center transition ${isSelected ? "bg-green-500 text-white" : "bg-white"
                                      }`}
                                  >
                                    {isSelected && <Check size={16} />}
                                  </div>

                                  {/* Offer Title */}
                                  <span className="text-sm">Offer ID:{offer.id} {offer.desc} </span>
                                </div>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {order.offers.length > 0 ? (
                        order.offers.map((offerId) => {
                          const selectedOffer = offers.find((offer) => offer.id === offerId);
                          return (
                            <span key={offerId} className="bg-cyan-500 px-2 py-1 rounded-md text-xs">
                              {selectedOffer ? selectedOffer.title : `Offer ${offerId.id}`}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-500 text-xs">No Offers Selected</span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  {editingId === order.id ? (
                    <Input value={tempOrder?.amount || ""} onChange={(e) => handleFieldChange("amount", e.target.value)} />
                  ) : (
                    order.amount
                  )}
                </TableCell>

                <TableCell>
                  {editingId === order.id ? (
                    <Select value={tempOrder?.status || ""} onValueChange={(value) => handleFieldChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    order.status
                  )}
                </TableCell>

                <TableCell>{order.date}</TableCell>

                <TableCell className="flex gap-2">
                  {editingId === order.id ? (
                    <>
                      <Button size="icon" variant="success" onClick={handleSave}>
                        <Check size={16} />
                      </Button>
                      <Button size="icon" variant="secondary" onClick={handleCancelEdit}>
                        ✖
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="outline" onClick={() => handleEdit(order)}>
                        <Pencil size={16} />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteOrder(order.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
