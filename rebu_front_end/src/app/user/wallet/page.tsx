"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast"; 

interface CryptoWallet {
  cryptoWallet: string;
  blockchain: string;
  cryptoType: string;
  memoTag?: string;
  walletProvider?: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<CryptoWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await fetch("/api/user/wallet");
        if (!response.ok) return Error("Failed to fetch wallet data");

        const data: CryptoWallet = await response.json();
        setWallet(data);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        toast({ title: "Error", description: "Failed to load wallet data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (wallet) {
      setWallet({ ...wallet, [e.target.name]: e.target.value });
    }
  };

  const handleWalletUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;

    if (wallet.cryptoWallet.length < 26) {
      toast({ title: "Invalid Wallet", description: "Please enter a valid crypto wallet address.", variant: "destructive" });
      return;
    }
    if (!wallet.blockchain || !wallet.cryptoType) {
      toast({ title: "Missing Fields", description: "Blockchain and cryptocurrency type are required.", variant: "destructive" });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/user/wallet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cryptoWallet: wallet.cryptoWallet,
          blockchain: wallet.blockchain,
          cryptoType: wallet.cryptoType,
          walletProvider: wallet.walletProvider,
          memoTag: wallet.memoTag || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update wallet");

      toast({ title: "Wallet Updated!", description: "Your crypto wallet has been saved." });
    } catch (error) {
      console.error("Error updating wallet:", error);
      toast({ title: "Error", description: "Failed to update wallet.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center space-y-8 p-6">
      <h1 className="text-3xl font-bold text-center">Crypto Wallet</h1>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Update Crypto Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWalletUpdate} className="space-y-4">
            <Label htmlFor="cryptoWallet">Wallet Address</Label>
            <Input id="cryptoWallet" name="cryptoWallet" value={wallet?.cryptoWallet} onChange={handleChange} required className="w-full" />

            <Label htmlFor="blockchain">Blockchain</Label>
            <Input id="blockchain" name="blockchain" value={wallet?.blockchain} onChange={handleChange} required className="w-full" />

            <Label htmlFor="cryptoType">Cryptocurrency</Label>
            <Input id="cryptoType" name="cryptoType" value={wallet?.cryptoType} onChange={handleChange} required className="w-full" />

            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Wallet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
