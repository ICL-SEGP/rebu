"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/constants";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/tables/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Input } from "@/components/ui/forms/input";
import { Check, Pencil, Trash2 } from "lucide-react";
import NewOrderForm from "@/components/ui/main/new-order-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/forms/popover";
import { Offer, Order, OrderStatus, Role, toOfferIds } from "@/types/app";
import { useQuery } from "@tanstack/react-query";
import {
  affiliateCancelOrder,
  affiliateGetUsersIdx,
  affiliateUpdateOrder,
  getAffiliateOffers,
  getAllLinkedOrders,
} from "@/lib/api/affiliate";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>(
    OrderStatus.ALL
  );
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const { data: session } = useSession();

  const {
    status,
    error,
    data: ordersList,
  } = useQuery({
    queryKey: ["affiliate-user-orders"],
    queryFn: () => getAllLinkedOrders(session!.accessToken),
  });

  useEffect(() => {
    if (ordersList) {
      ordersList.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      setOrders(ordersList);
    }
  }, [ordersList]);

  const { data: offersList } = useQuery({
    queryKey: ["affiliate-offers"],
    queryFn: () => getAffiliateOffers(session!.accessToken),
  });

  useEffect(() => {
    if (offersList) {
      setOffers(offersList);
    }
  }, [offersList]);

  // Search Handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Status Filter Handler
  const handleFilterStatus = (status: OrderStatus) => {
    setStatusFilter(status);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      let userEmail = "";
      if (order.user && typeof order.user.email === "string") {
        userEmail = order.user.email.toLowerCase();
      }

       const dateString = order.orderDate.toDateString().toLowerCase();
       const dateSearch = dateString.includes(
         searchQuery.toLowerCase().trim()
       );

      const userName =
        order.user.firstName.toLowerCase() +
        " " +
        order.user.lastName.toLowerCase();

      const matchesSearch =
        userEmail.includes(searchQuery.toLowerCase()) ||
        userName.includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === OrderStatus.ALL || order.status === statusFilter;

      return (matchesSearch || dateSearch) && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Confirm Update Handler
  const handleConfirmUpdate = async (updatedOrder: Order) => {
    if (
      !window.confirm(
        `Are you sure you want to update Order #${updatedOrder.id}?`
      )
    )
      return;

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

  // Categorize Orders by Status
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
      <NewOrderForm setOrders={setOrders} offers={offers} />
      {completedOrders.length > 0 && (
        <OrderSection
          title="Completed Orders"
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          orders={completedOrders}
          borderColor="border-green-500"
          setOrders={setOrders}
          offers={offers}
        />
      )}
      Orders Sections
      {pendingOrders.length > 0 && (
        <OrderSection
          title="Pending Orders"
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          orders={pendingOrders}
          borderColor="border-orange-500"
          setOrders={setOrders}
          offers={offers}
        />
      )}
      {refundedOrders.length > 0 && (
        <OrderSection
          title="Refunded Orders"
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          orders={refundedOrders}
          borderColor="border-red-500"
          setOrders={setOrders}
          offers={offers}
        />
      )}
    </div>
  );
}

function OrderSection({
  title,
  orders,
  borderColor,
  selectedOrderId,
  setSelectedOrderId,
  setOrders,
  offers,
}: {
  title: string;
  orders: Order[];
  borderColor: string;
  setSelectedOrderId: any;
  selectedOrderId: number | null;
  setOrders: any;
  offers: Offer[];
}) {
  const { data: session } = useSession();

  const [tempOrder, setTempOrder] = useState<Order | null>(null);
  const [tempOrderCopy, setTempOrderCopy] = useState<Order | null>(null);
  const [selectedOffers, setSelectedOffers] = useState<Offer[]>([]);

  useEffect(() => {
    if (tempOrder) {
      setSelectedOffers(tempOrder.offers || []);
    }
  }, [tempOrder]);

  const handleFieldChange = (field: keyof Order, value: string) => {
    if (tempOrder) setTempOrder({ ...tempOrder, [field]: value });
  };

  // Edit Order
  const handleEdit = (order: Order) => {
    setSelectedOrderId(order.id);
    setTempOrder({ ...order });
    setTempOrderCopy({ ...order });
  };

  // Cancel Edit
  const handleCancelEdit = (order: Order) => {
    setSelectedOrderId(null);
    setTempOrder(order);
    setTempOrderCopy(order);
  };

  const handleSave = async () => {
    if (!tempOrder) return;

    if (JSON.stringify(tempOrder) === JSON.stringify(tempOrderCopy)) {
      handleCancelEdit(tempOrder);
      return;
    }

    if (
      !window.confirm(`Are you sure you want to update Order #${tempOrder.id}?`)
    ) {
      return;
    }

    try {
      const updateOrder = {
        ...tempOrder,
        offers: toOfferIds(tempOrder.offers),
      };

      const updatedOrder = await affiliateUpdateOrder(
        session!.accessToken,
        updateOrder
      );

      setOrders((prevOrders: Order[]) =>
        prevOrders.map((order) =>
          order.id === tempOrder.id ? tempOrder : order
        )
      );

      setSelectedOrderId(null);
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  useEffect(() => {
    if (selectedOrderId) {
      const editingOrder = orders.find((order) => order.id === selectedOrderId);
      if (editingOrder) {
        setTempOrder(editingOrder); // Sync tempOrder with selected order
        setTempOrderCopy(editingOrder);
      }
    }
  }, [selectedOrderId, orders]);

  return (
    <Card className={`border-2 ${borderColor} rounded-lg shadow-lg`}>
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Order ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Offer</TableHead>
              <TableHead>Rebate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.user.email}</TableCell>

                  <TableCell>
                    {selectedOrderId === order.id ? (
                      <div className="flex flex-col space-y-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              {order.offers && order.offers.length > 0
                                ? `${order.offers.length} offer(s) selected`
                                : "Select Offers"}
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            align="start"
                            className="w-auto p-2 bg-white border rounded-lg shadow-lg"
                          >
                            <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto p-2">
                              {offers.map((offer) => {
                                const editingOrder = orders.find(
                                  (order) => order.id === selectedOrderId
                                );
                                const isSelected = selectedOffers.some(
                                  (o) => o.id === offer.id
                                );

                                return (
                                  <div
                                    key={offer.id}
                                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                                    onClick={() => {
                                      // setOrders((prevOrders: Order[]) =>
                                      //   prevOrders.map((order) =>
                                      //     order.id === selectedOrderId
                                      //       ? {
                                      //           ...order,
                                      //           offers: isSelected
                                      //             ? order.offers.filter(
                                      //                 (id) => id !== offer
                                      //               )
                                      //             : [...order.offers, offer],
                                      //         }
                                      //       : order
                                      //   )
                                      // );

                                      setTempOrder((prev) => {
                                        if (!prev) return prev; // ✅ If prev is null, return null

                                        const previousOffers =
                                          prev.offers || []; // ✅ Ensure prev.offers is always an array
                                        const updatedOffers = isSelected
                                          ? previousOffers.filter(
                                              (o) => o.id != offer.id
                                            ) // ✅ Remove if already selected
                                          : [...previousOffers, offer].sort(
                                              (a, b) => a.id - b.id
                                            ); // ✅ Add & sort

                                        return {
                                          ...prev,
                                          offers: updatedOffers,
                                        };
                                      });
                                    }}
                                  >
                                    {/* Checkbox UI */}
                                    <div
                                      className={`w-5 h-5 border rounded-md flex items-center justify-center transition ${
                                        isSelected
                                          ? "bg-green-500 text-white"
                                          : "bg-white"
                                      }`}
                                    >
                                      {isSelected && <Check size={16} />}
                                    </div>

                                    {/* Offer Title */}
                                    <span className="text-sm">
                                      Offer ID:{offer.id} {offer.desc}{" "}
                                    </span>
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
                          order.offers.map((offer) => {
                            const selectedOffer = offers.find(
                              (offer) => offer.id === offer.id
                            );
                            return (
                              <span
                                key={offer.id}
                                className="bg-cyan-500 px-2 py-1 rounded-md text-xs"
                              >
                                {`Offer ${offer.id}`}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-500 text-xs">
                            No Offers Selected
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {selectedOrderId === order.id ? (
                      <Input
                        value={tempOrder?.totalRebateAmount || ""}
                        onChange={(e) =>
                          handleFieldChange("totalRebateAmount", e.target.value)
                        }
                      />
                    ) : (
                      order.totalRebateAmount
                    )}
                  </TableCell>

                  <TableCell>
                    {selectedOrderId === order.id ? (
                      <Select
                        value={tempOrder?.status || ""}
                        onValueChange={(value) =>
                          handleFieldChange("status", value)
                        }
                      >
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

                  <TableCell>{order.orderDate.toLocaleDateString()}</TableCell>

                  <TableCell className="flex gap-2">
                    {selectedOrderId === order.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="success"
                          onClick={handleSave}
                          className="bg-green-100"
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={handleCancelEdit}
                        >
                          ✖
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(order)}
                        >
                          <Pencil size={16} />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No orders available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
