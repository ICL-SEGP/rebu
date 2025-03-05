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
} from "@/components/ui/tables/table";
import { Badge } from "@/components/ui/helpers/badge";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/constants";
import OrderTable from "@/components/ui/main/orders_table";
import { getUserOrders } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@/types/app";



// Backend API endpoint (Replace with your actual API)
const API_URL = "/api/orders";

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);


  const {
    status,
    error,
    data: ordersList,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getUserOrders(session!.accessToken),
  });

  useEffect(() => {
    if (ordersList) {
      setOrders(ordersList);
    }
  }, [ordersList]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <OrderTable orders={orders} />
    </div>
  );
}
