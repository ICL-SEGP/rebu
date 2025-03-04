"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";

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
import { API_BASE_URL } from "@/lib/constants";
import { getAffiliateProfile } from "@/lib/api/affiliate";
import { getUserProfile } from "@/lib/api/user";
import { register } from "module";
import { registerUser } from "@/lib/api/auth";
import { Credentials } from "@/types/app";

const Register = () => {
  const [credentials, setCredentials] = useState<Credentials>();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !credentials?.email ||
      !credentials.password ||
      !credentials?.firstName ||
      !credentials?.lastName
    ) {
      setError("Missing sign-in details.");
      return;
    }

    const user = await registerUser(credentials);

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
          <CardTitle>Registration</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Gabriel"
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev!,
                      firstName: e.target.value,
                    }))}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Costa"
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev!,
                      lastName: e.target.value,
                    }))}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="john.smith@gmail.com"
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
                  placeholder="********"
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
                  Register
                </Button>
              </div>
            </div>
          </form>
          <CardDescription>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/sign-in")}
                  className="text-blue-500 hover:underline"
                >
                  Sign-in here
                </button>
              </p>
            </div>
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
