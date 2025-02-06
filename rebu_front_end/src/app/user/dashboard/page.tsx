"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast"; 
import { Coins, Lock, Wallet } from "lucide-react"; 
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


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

  // Dummy Order Data
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

      {/* Enhanced Key Metrics UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Locked Tokens */}
        <Card className="border border-red-400 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-red-600 text-lg">Locked Tokens</CardTitle>
            <Lock className="text-red-500 w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-red-600">{balance?.lockedTokens ?? 0}</p>
            <p className="text-sm text-gray-500">Tokens pending release</p>
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
              {orders.map((order, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition">
                  <TableCell className="font-medium px-4 py-2">{order.date}</TableCell>
                  <TableCell className="px-4 py-2">{order.product}</TableCell>
                  <TableCell className="text-right px-4 py-2">{order.tokens}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
