"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { Coins, Link, Trash, Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_BASE_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { getUserOrders } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@/types/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { getBalance } from "@/lib/api/solana";

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  const { data: session } = useSession();

  const { publicKey } = useWallet();

  useEffect(() => {
    if (sessionStorage.getItem("fromSignIn")) {
      toast.success("Welcome! Successfully signed in.");

      // Remove the flag so the toast does not show on refresh
      sessionStorage.removeItem("fromSignIn");
    }

    if (sessionStorage.getItem("referral-code")) {
      setTimeout(() => {
        const code = sessionStorage.getItem("referral-code");

        toast.success(`You signed up with referral code ${code}`);

        // Remove the flag so the toast does not show on refresh
        sessionStorage.removeItem("referral-code");
      });
    }
  }, []);

  const fetchBalance = async () => {
    try {
      const bal = await getBalance(session!.accessToken);
      setBalance(bal.balance);
    } catch (e) {
      console.log("Error", e);
    }
  };

  useEffect(() => {
    if (publicKey) {
      // 🔹 Wait 3 seconds before showing the balance fetch toast
      setTimeout(() => {
        toast.dismiss();
        toast.promise(
          fetchBalance,
          {
            loading: "Fetching balance...",
            success: <b>Fetched balance from blockchain!</b>,
            error: <b>Balance could not be fetched.</b>,
          },
          { id: "fetching-balance" }
        );
      }, 3000); // 3-second delay
    } else {
      setTimeout(() => {
        toast.dismiss();
        toast("To fetch balance, connect your Solana wallet!", {
          icon: "ℹ",
          id: "no-wallet",
        });
      }, 3000);
    }
  }, [publicKey]);

  if (!session) {
    throw new Error("No user logged in.");
  }

  // Dummy Order Data
  const {
    status,
    error,
    data: ordersList,
  } = useQuery({
    queryKey: ["user-orders"],
    queryFn: () => getUserOrders(session!.accessToken),
  });

  useEffect(() => {
    if (ordersList) {
      ordersList.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      setOrders(ordersList.slice(0, 5));
    }
  }, [ordersList]);

  // Handle Withdrawal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balance) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid withdrawal amount.");

      return;
    }

    if (amount > balance) {
      toast.error("Not enough available tokens.");
      return;
    }

    setIsWithdrawing(true);
    // TODO handle withdarwal
    try {
      const response = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) throw new Error("Withdrawal failed");

      toast.success(`Withdrawn ${amount} tokens to your wallet.`);

      // Update balance locally after successful withdrawal
      setBalance(balance - amount);

      setWithdrawAmount(""); // Reset input
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load data.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold text-center">
        Hello {session.user.firstName}!
      </h1>

      {/* Enhanced Key Metrics UI */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Tokens */}
        <Card className="border border-green-400 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-green-600 text-lg">
              Available Tokens
            </CardTitle>
            <Coins className="text-green-500 w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-green-600">
              {balance ?? 0}
            </p>
            <p className="text-sm text-gray-500">Tokens ready for withdrawal</p>
          </CardContent>
          <CardContent>
            <Button
              onClick={fetchBalance}
              className="w-full mt-5 bg-green-600 hover:bg-green-700"
            >
              {" "}
              Refresh Balance{" "}
            </Button>
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

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isWithdrawing}
              >
                {isWithdrawing ? "Processing..." : "Withdraw"}
              </Button>

              {/* Wallet Address Display */}
              <Separator />
              <p className="text-gray-500 text-sm">
                <Wallet className="inline-block w-4 h-4 text-blue-500" />{" "}
                Withdrawals will be sent to:{" "}
                <span className="font-semibold text-blue-600">
                  {publicKey?.toString() || "No wallet set"}
                </span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardTitle>Recent Transactions</CardTitle>
            <Button onClick={() => router.push("/user/orders")}>
              {" "}
              My Orders{" "}
            </Button>
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
                <TableHead className="text-right px-4 py-3">
                  Token's Earned
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition">
                  <TableCell className="font-medium px-4 py-2">
                    {order.id}
                  </TableCell>
                  <TableCell className="font-medium px-4 py-2">
                    {order.orderDate.toDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-2">{order.status}</TableCell>
                  <TableCell className="text-right px-4 py-2">
                    {order.totalRebateAmount}
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
