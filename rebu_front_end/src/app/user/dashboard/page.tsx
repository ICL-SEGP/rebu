"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast"; // Toast notifications
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Token Balance & Orders Type
interface TokenBalance {
  availableTokens: number;
  lockedTokens: number;
  cryptoWallet: string;
}

interface Order {
  date: string;
  product: string;
  tokens: string;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  // Dummy Order Data (Replace with API Data)
  const orders: Order[] = [
    { date: "2025-01-10", product: "Product A", tokens: "100" },
    { date: "2025-01-08", product: "Product B", tokens: "400" },
    { date: "2025-01-07", product: "Product A", tokens: "100" },
    { date: "2025-01-01", product: "Product C", tokens: "300" },
  ];

  // Fetch Token Balance from Backend
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/user/balance");
        if (!response.ok) throw new Error("Failed to fetch balance");

        const data: TokenBalance = await response.json();
        setBalance(data);
      } catch (error) {
        console.error("Error fetching balance:", error);
        toast({ title: "Error", description: "Failed to load balance.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
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
      <h1 className="text-3xl font-bold text-center">User Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-500">Available Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{balance?.availableTokens ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Locked Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{balance?.lockedTokens ?? 0}</p>
          </CardContent>
        </Card>
      </div>

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

            <Button type="submit" className="w-full" disabled={isWithdrawing}>
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </Button>

            {/* Wallet Address Display */}
            <Separator />
            <p className="text-gray-500 text-sm">
              Withdrawals will be sent to:{" "}
              <span className="font-semibold text-blue-600">{balance?.cryptoWallet || "No wallet set"}</span>
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full border rounded-lg shadow-md">
            <TableCaption>A list of your recent purchases</TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[150px] px-4 py-3">Date</TableHead>
                <TableHead className="px-4 py-3">Product</TableHead>
                <TableHead className="text-right px-4 py-3">Tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 transition">
                    <TableCell className="font-medium px-4 py-2">{order.date}</TableCell>
                    <TableCell className="px-4 py-2">{order.product}</TableCell>
                    <TableCell className="text-right px-4 py-2">{order.tokens}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
