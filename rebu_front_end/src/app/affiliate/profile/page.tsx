"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { useSession } from "next-auth/react";

export default function AffiliateProfile() {
  const { data: session } = useSession();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: session?.user?.email || "",
    password: "",
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Profile:", formData);
    // TODO: API call to update affiliate profile
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold">Affiliate Profile</h1>

      <Card className="mt-6 w-full max-w-lg">
        <CardHeader>
          <CardTitle>Edit Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input name="email" value={formData.email} disabled className="bg-gray-100 cursor-not-allowed" />
            </div>

            <div>
              <Label>New Password</Label>
              <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter new password" />
            </div>

            <Button type="submit" className="w-full">
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
