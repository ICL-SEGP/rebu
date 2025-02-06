"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast"; // Toast notifications

// User Profile Type
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cryptoWallet: string;
  blockchain: string;
  cryptoType: string;
  memoTag?: string; // Optional for XRP, Stellar
  walletProvider?: string; // Optional (MetaMask, Coinbase, etc.)
}

// Initial User Data (Hardcoded for Testing, Replace with API)
const initialProfile: UserProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@example.com",
  password: "",
  cryptoWallet: "",
  blockchain: "",
  cryptoType: "",
  memoTag: "",
  walletProvider: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isWalletUpdating, setIsWalletUpdating] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle Profile Update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Profile Updated!", description: "Your profile info has been updated successfully." });
  };

  // Handle Crypto Wallet Update
  const handleWalletUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic crypto wallet validation
    if (profile.cryptoWallet.length < 26) {
      toast({ title: "Invalid Wallet", description: "Please enter a valid crypto wallet address.", variant: "destructive" });
      return;
    }
    if (!profile.blockchain) {
      toast({ title: "Select Blockchain", description: "Please select a blockchain network.", variant: "destructive" });
      return;
    }
    if (!profile.cryptoType) {
      toast({ title: "Select Cryptocurrency", description: "Please select the crypto type.", variant: "destructive" });
      return;
    }

    setIsWalletUpdating(true);
    setTimeout(() => {
      setIsWalletUpdating(false);
      toast({ title: "Wallet Updated!", description: "Your crypto wallet has been saved." });
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">User Profile</h1>

      {/* Profile Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={profile.firstName} onChange={handleChange} required />
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={profile.lastName} onChange={handleChange} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleChange} required />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter new password" onChange={handleChange} />
            </div>

            {/* Save Button */}
            <Button type="submit" className="w-full">
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Crypto Wallet Section */}
      <Card>
        <CardHeader>
          <CardTitle>Update Crypto Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWalletUpdate} className="space-y-4">
            {/* Wallet Address */}
            <div>
              <Label htmlFor="cryptoWallet">Crypto Wallet Address</Label>
              <Input
                id="cryptoWallet"
                name="cryptoWallet"
                placeholder="Enter your crypto wallet address"
                value={profile.cryptoWallet}
                onChange={handleChange}
                required
              />
            </div>

            {/* Blockchain Selection */}
            <div>
              <Label htmlFor="blockchain">Blockchain Network</Label>
              <select
                id="blockchain"
                name="blockchain"
                value={profile.blockchain}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Blockchain</option>
                <option value="Ethereum">Ethereum (ETH)</option>
                <option value="Solana">Solana (SOL)</option>
                <option value="Binance Smart Chain">Binance Smart Chain (BSC)</option>
                <option value="Polygon">Polygon (MATIC)</option>
                <option value="Avalanche">Avalanche (AVAX)</option>
              </select>
            </div>

            {/* Cryptocurrency Selection */}
            <div>
              <Label htmlFor="cryptoType">Cryptocurrency Type</Label>
              <select
                id="cryptoType"
                name="cryptoType"
                value={profile.cryptoType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Cryptocurrency</option>
                <option value="USDC">USDC</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="BNB">Binance Coin (BNB)</option>
              </select>
            </div>

            {/* Wallet Provider */}
            <div>
              <Label htmlFor="walletProvider">Wallet Provider</Label>
              <Input
                id="walletProvider"
                name="walletProvider"
                placeholder="e.g., Coinbase, MetaMask, Phantom"
                value={profile.walletProvider}
                onChange={handleChange}
              />
            </div>

            {/* Update Button */}
            <Button type="submit" className="w-full" disabled={isWalletUpdating}>
              {isWalletUpdating ? "Updating..." : "Update Wallet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
