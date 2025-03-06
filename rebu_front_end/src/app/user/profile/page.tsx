"use client";

import { useState } from "react";
import Image from "next/image";
import { User, UserBalance, Role } from "@/types/app";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/helpers/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/helpers/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/modals/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserIcon } from "@heroicons/react/24/solid"; // Using an icon for profile image placeholder
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// Dummy user data for UI testing
const dummyUser: User = {
  id: 1,
  firstName: "John",
  LastName: "Doe",
  email: "john.doe@example.com",
  token_balance: 500,
  role: Role.USER,
  orderIds: 12345,
  solanaPubKey: "5F3b5b8b32B3b...",
};

const dummyBalance: UserBalance = {
  token_balance: 500,
  locked_tokens: 50,
  rescinded_token: 10,
  last_updated: new Date(),
};

export default function UserProfile() {
  const [user, setUser] = useState<User>(dummyUser);
  const [balance, setBalance] = useState<UserBalance>(dummyBalance);
  const [editing, setEditing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>(dummyUser);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    try {
      setUser({ ...user, ...formData });
      setEditing(false);
      toast({ title: "Profile updated successfully" });
      // TODO: Send updated data to backend API
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    try {
      // TODO: Integrate password update API
      toast({ title: "Password updated successfully" });
      setPasswordModalOpen(false);
    } catch (error) {
      console.error("Error updating password:", error);
      toast({ title: "Failed to update password", variant: "destructive" });
    }
  };

  return (
    <Card className="max-w-lg mx-auto p-6">
      <CardHeader>
        <div className="flex flex-col items-center">
          <UserIcon className="w-24 h-24 text-gray-500" />
          <CardTitle className="mt-4">User Profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">First Name</label>
            <Input
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <Input
              name="LastName"
              value={formData.LastName || ""}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Token Balance</label>
            <Input value={balance.token_balance} disabled />
          </div>
          <div className="flex justify-between mt-4">
            {editing ? (
              <>
                <Button onClick={handleSubmit}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>Edit</Button>
            )}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => setPasswordModalOpen(true)}>Change Password</Button>
          </div>
        </div>
      </CardContent>

      {/* Password Change Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {["currentPassword", "newPassword", "confirmPassword"].map((field, index) => (
              <div key={index} className="relative">
                <Input
                  name={field}
                  type={showPassword[field as keyof typeof showPassword] ? "text" : "password"}
                  placeholder={field.replace("Password", " password")}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center"
                  onClick={() => togglePasswordVisibility(field as "current" | "new" | "confirm")}
                >
                  {showPassword[field as keyof typeof showPassword] ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            ))}
            <div className="flex justify-end">
              <Button onClick={handleChangePassword}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
