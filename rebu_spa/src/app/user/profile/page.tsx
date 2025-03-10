"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EyeOff, UserIcon, EyeIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { updateUserProfile } from "@/lib/api/user";
import toast from "react-hot-toast"; // Import toast from react-hot-toast
import { changePassword } from "@/lib/api/auth";

export default function UserProfile() {
  const { data: session, update } = useSession();
  console.log(session?.user);
  const [editing, setEditing] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState(
    session?.user
      ? { ...session.user }
      : { firstName: "", lastName: "", email: "" }
  );
  const originalFormData = useRef(
    session?.user
      ? { ...session.user }
      : { firstName: "", lastName: "", email: "" }
  );
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [renderTrigger, setRenderTrigger] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedPasswords = { ...passwordData, [name]: value };
    setPasswordData(updatedPasswords);

    if (name === "newPassword" || name === "confirmPassword") {
      setPasswordsMatch(
        updatedPasswords.newPassword === updatedPasswords.confirmPassword
      );
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    try {
      if (!session?.user) {
        toast.error("Session user data is missing.");
        return;
      }

      console.log("Session User:", formData);

      await updateUserProfile(session.accessToken, formData);
      setEditing(false);

      session.user.firstName = formData.firstName;
      session.user.lastName = formData.lastName;
      session.user.email = formData.email;

      await update(session);

      originalFormData.current = formData;
      toast.success("Profile updated successfully");
      setRenderTrigger((prev) => prev + 1);

      console.log("Updated Session:", session);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("That email is taken.");
      setEditing(false);
      setFormData(originalFormData.current);
    }
  };

  const handleCancel = () => {
    setFormData(originalFormData.current);
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await changePassword(
        session?.accessToken,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      toast.success("Password updated successfully");
      setPasswordModalOpen(false);
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Your existing password was incorrect!");
    }
  };

  return (
    <Card className="max-w-lg mx-auto p-6" key={renderTrigger}>
      <CardHeader>
        <div className="flex flex-col items-center">
          <UserIcon className="w-24 h-24 text-gray-500" />
          <CardTitle className="mt-4">
            {session?.user?.firstName} {session?.user?.lastName}'s Profile
          </CardTitle>
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
              name="lastName"
              value={formData.lastName || ""}
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
          <div className="flex justify-between mt-4">
            {editing ? (
              <>
                <Button onClick={handleSubmit}>Save</Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>Edit</Button>
            )}
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setPasswordModalOpen(true)}
            >
              Change Password
            </Button>
          </div>
        </div>
      </CardContent>
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {["currentPassword", "newPassword", "confirmPassword"].map(
              (field, index) => (
                <div key={index} className="relative">
                  <Input
                    name={field}
                    type={
                      showPassword[field as keyof typeof showPassword]
                        ? "text"
                        : "password"
                    }
                    placeholder={field.replace("Password", " password")}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center"
                    onClick={() =>
                      togglePasswordVisibility(
                        field as "current" | "new" | "confirm"
                      )
                    }
                  >
                    {showPassword[field as keyof typeof showPassword] ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )
            )}
            <div className="flex justify-end">
              <Button onClick={handleChangePassword} disabled={!passwordsMatch}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}


  // const generateReferralLink = (code: any): string => {
  //   return `${window.location.origin}/register?affiliate_code=${code}`;
  // };

  // const copyToClipboard = async () => {
  //   try {
  //     await navigator.clipboard.writeText(
  //       generateReferralLink(referralCode.referral_code)
  //     );
  //     toast({ title: "Referral link copied to clipboard!" });
  //   } catch (err) {
  //     toast({
  //       title: "Failed to copy link!",
  //       description: "Please copy manually.",
  //       variant: "destructive",
  //     });
  //   }
  // // };

  // <Button
  //   className="w-full mt-5 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
  //   onClick={copyToClipboard}
  // >
  //   <ClipboardCopy size={16} />
  //   Copy Rebu referral to Clipboard
  // </Button>;