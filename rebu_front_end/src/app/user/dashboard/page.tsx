"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Separator } from "@/components/ui/helpers/separator";
import { toast } from "@/hooks/use-toast";
import { Coins, Link, Lock, Trash, Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/tables/table";
import { API_BASE_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";
import OrderTable from "@/components/ui/main/orders_table";
import { useRouter, useSearchParams } from "next/navigation";
import { toast as tot} from "react-hot-toast";



interface TokenBalance {
  availableTokens: number;
  lockedTokens: number;
  rescindedTokens: number;
  cryptoWallet: string;
}

interface Order {
  id: number;
  status: string;
  date: string;
  totalRebateAmount: number; // ✅ Matches parseFloat()
}


export default function DashboardPage() {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (sessionStorage.getItem("fromSignIn")) {
      tot.success("Welcome! Successfully signed in.");

      // Remove the flag so the toast does not show on refresh
      sessionStorage.removeItem("fromSignIn");
    }
  }, []);

  if (!session) {
    throw new Error("No user logged in.");
  }

  // Dummy Order Data
  // const orders: Order[] = [
  //   { date: "2025-01-10", product: "Product A", tokens: "100" },
  //   { date: "2025-01-08", product: "Product B", tokens: "400" },
  //   { date: "2025-01-07", product: "Product A", tokens: "100" },
  //   { date: "2025-01-01", product: "Product C", tokens: "300" },
  // ];


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
        totalRebateAmount: parseFloat(order.total_rebate_amount).toFixed(2), // Convert to number
      }))


      setOrders(fetchedOrders.slice(0, 3));


    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchBalance = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/balance`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch balance");

      const balance = await res.json();
      setBalance({ availableTokens: balance.tokens.toFixed(2), lockedTokens: balance.locked.toFixed(2), rescindedTokens: balance.rescinded.toFixed(2), cryptoWallet: "" });
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast({ title: "Error", description: "Failed to load balance.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  // Fetch Token Balance from Backend
  useEffect(() => {
    fetchBalance();
    fetchOrders();
  }, []);

  // Handle Withdrawal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balance) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Enter a valid withdrawal amount.", variant: "destructive" });
      return;
    }

    if (amount > balance.availableTokens) {
      toast({ title: "Insufficient Balance", description: "Not enough available tokens.", variant: "destructive" });
      return;
    }

    setIsWithdrawing(true);
    try {
      const response = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) throw new Error("Withdrawal failed");

      toast({ title: "Success", description: `Withdrawn ${amount} tokens to your wallet.` });

      // Update balance locally after successful withdrawal
      setBalance((prev) => prev && { ...prev, availableTokens: prev.availableTokens - amount });
      setWithdrawAmount(""); // Reset input
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({ title: "Error", description: "Failed to load data.", variant: "destructive" });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold text-center">Hello {session.user.name}!</h1>

      {/* Enhanced Key Metrics UI */}

      {/* Available Tokens */}
      <Card className="border border-green-400 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-green-600 text-lg">Available Tokens</CardTitle>
          <Coins className="text-green-500 w-6 h-6" />
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold text-green-600">{balance?.availableTokens ?? 0}</p>
          <p className="text-sm text-gray-500">Tokens ready for withdrawal</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Locked Tokens */}
        <Card className="border border-orange-400 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-orange-600 text-lg">Locked Tokens</CardTitle>
            <Lock className="text-orange-500 w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-orange-600-600">{balance?.lockedTokens ?? 0}</p>
            <p className="text-sm text-gray-500">Tokens pending release</p>
          </CardContent>
        </Card>

        <Card className="border border-red-400 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-red-600 text-lg">Rescinded Tokens</CardTitle>
            <Trash className="text-red-500 w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-red-600">{balance?.rescindedTokens ?? 0}</p>
            <p className="text-sm text-gray-500">Tokens pending release</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <Button onClick={fetchBalance} className="w-full mt-5 bg-green-600 hover:bg-green-700"> Refresh Balance </Button>
        </CardContent>
      </Card>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <Label htmlFor="withdrawAmount">Amount</Label>
              <Input
                id="withdrawAmount"
                type="number"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isWithdrawing}>
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </Button>

            {/* Wallet Address Display */}
            <Separator />
            <p className="text-gray-500 text-sm">
              <Wallet className="inline-block w-4 h-4 text-blue-500" /> Withdrawals will be sent to:{" "}
              <span className="font-semibold text-blue-600">{balance?.cryptoWallet || "No wallet set"}</span>
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardTitle>Recent Transactions</CardTitle>
            <Button onClick={() => router.push("/user/orders")}> My Orders </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="w-full border rounded-lg shadow-md">
            <TableCaption>A list of your recent purchases</TableCaption>
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
    </div>


  );
}
