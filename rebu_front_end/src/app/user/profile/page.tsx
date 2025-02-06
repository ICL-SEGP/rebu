"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast"; 


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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isWalletUpdating, setIsWalletUpdating] = useState<boolean>(false);

  // Fetch user data 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({ title: "Error", description: "Failed to load profile data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  // Handle Profile Update (Name, Email, Password)
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsUpdating(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          password: profile.password, // Backend should hash before storing
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast({ title: "Profile Updated!", description: "Your profile info has been saved." });
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Error",
          description: `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        });
      }
       finally {
      setIsUpdating(false);
    }
  };

  // Handle Crypto Wallet Update
  const handleWalletUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Basic wallet validation
    if (profile.cryptoWallet.length < 26) {
      toast({ title: "Invalid Wallet", description: "Please enter a valid crypto wallet address.", variant: "destructive" });
      return;
    }
    if (!profile.blockchain || !profile.cryptoType) {
      toast({ title: "Missing Fields", description: "Blockchain and cryptocurrency type are required.", variant: "destructive" });
      return;
    }

    setIsWalletUpdating(true);
    try {
      const response = await fetch("/api/user/wallet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cryptoWallet: profile.cryptoWallet,
          blockchain: profile.blockchain,
          cryptoType: profile.cryptoType,
          walletProvider: profile.walletProvider,
          memoTag: profile.memoTag || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update wallet");

      toast({ title: "Wallet Updated!", description: "Your crypto wallet has been saved." });
    } catch (error) {
        console.error("Error updating wallet:", error);
        toast({
          title: "Error",
          description: `Failed to update wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        });
      }
       finally {
      setIsWalletUpdating(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

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
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={profile?.firstName} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={profile?.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile?.email} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter new password" onChange={handleChange} />
            </div>

            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Profile"}
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
            <div>
              <Label htmlFor="cryptoWallet">Crypto Wallet Address</Label>
              <Input id="cryptoWallet" name="cryptoWallet" value={profile?.cryptoWallet} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="blockchain">Blockchain</Label>
              <Input id="blockchain" name="blockchain" value={profile?.blockchain} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="cryptoType">Cryptocurrency</Label>
              <Input id="cryptoType" name="cryptoType" value={profile?.cryptoType} onChange={handleChange} required />
            </div>

            <Button type="submit" className="w-full" disabled={isWalletUpdating}>
              {isWalletUpdating ? "Updating..." : "Update Wallet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
