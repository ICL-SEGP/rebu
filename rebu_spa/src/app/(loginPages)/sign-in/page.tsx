"use client";

import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Credentials } from "@/types/types";

const signInPage = () => {
  const [credentials, setCredentials] = useState<Credentials>();
  const [error, setError] = useState("");
  const router = useRouter();
  const [isAffiliate, setIsAffiliate] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!credentials?.email || !credentials.password) {
      setError("Missing sign-in details.");
      return;
    }

    const response = await signIn("credentials", {
      email: credentials!.email,
      password: credentials!.password,
      isAffiliate,
      redirect: false,
    });

    if (response?.error) {
      setError("Invalid user type, email or password.");
      return;
    }

    const session = await getSession();

    if (sessionStorage.getItem("referral-code")) {
      await sessionStorage.removeItem("referral-code");
    }

    // ✅ Store flag for notification on dashboard
    sessionStorage.setItem("fromSignIn", "true");
    console.log(session);
    // ✅ Redirect based on user role
    if (session!.user.role === "affiliate") {
      router.push("/affiliate/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            <Label className="text-red-500">{error}</Label>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="user@gmail.com"
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev!,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="*******"
                  type="password"
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev!,
                      password: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={isAffiliate ? "outline" : "default"}
                  onClick={() => setIsAffiliate(false)}
                  className="w-1/2"
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant={isAffiliate ? "default" : "outline"}
                  onClick={() => setIsAffiliate(true)}
                  className="w-1/2"
                >
                  Affiliate
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <Button type="submit" className="w-full">
                  Go
                </Button>
              </div>
            </div>
          </form>
          <CardDescription>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-blue-500 hover:underline"
                >
                  Create an Account
                </button>
              </p>
            </div>
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default signInPage;
