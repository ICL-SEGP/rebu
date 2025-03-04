"use client";

import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/helpers/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/helpers/card";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Credentials } from "@/types/app";
import { getUserProfile } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import { getAffiliateProfile } from "@/lib/api/affiliate";

const signInPage = () => {
  const [credentials, setCredentials] = useState<Credentials>();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!credentials?.email || !credentials.password) {
      setError("Missing sign-in details.");
      return;
    }

    const response = await signIn("credentials", {
      email: credentials!.email,
      password: credentials!.password,
      redirect: false,
    });

    if (response?.error) {
      setError("Invalid email or password.");
      return;
    }

    const session = await getSession();

    const profile =
      session!.user.role === "affiliate"
        ? await getAffiliateProfile(session!.accessToken)
        : await getUserProfile(session!.accessToken);

    if (profile) {
      sessionStorage.setItem("profile", JSON.stringify(profile));
    }

    // ✅ Store flag for notification on dashboard
    sessionStorage.setItem("fromSignIn", "true");

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
