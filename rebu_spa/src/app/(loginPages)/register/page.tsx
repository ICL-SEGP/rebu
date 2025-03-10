"use client";

import { getSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { registerAffiliate, registerUser } from "@/lib/api/auth";

const Register = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [referralCode, setReferralCode] = useState<string | null>("");
  const [credentials, setCredentials] = useState<Credentials>();
  const [error, setError] = useState("");
  const [isAffiliate, setIsAffiliate] = useState(false);

  useEffect(() => {
    const urlReferralCode = searchParams.get("affiliate_code");

    if (urlReferralCode) {
      setReferralCode(urlReferralCode);
      localStorage.setItem("affiliate_code", urlReferralCode);
    } else {
      const storedReferralCode = localStorage.getItem("affiliate_code");
      if (storedReferralCode) {
        setReferralCode(storedReferralCode);
      }
    }
  }, [searchParams]);

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

    try {
      if (isAffiliate) {
        await registerAffiliate(credentials);
      } else {
        await registerUser(credentials, referralCode);
      }
    } catch {
      setError("Email taken.");
      return;
    }

    const response = await signIn("credentials", {
      email: credentials!.email,
      password: credentials!.password,
      isAffiliate,
      redirect: false,
    });

    if (response?.error) {
      console.log("error");
      setError("Invalid email or password.");
      return;
    }

    const session = await getSession();

    sessionStorage.setItem("fromSignIn", "true");
    if (referralCode != null) {
      sessionStorage.setItem("referral-code", referralCode);
    }

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
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Gabriel"
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Costa"
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="john.smith@gmail.com"
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
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
                      ...prev,
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
                  Regular User
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

              {referralCode && (
                <p className="text-xs text-gray-600">
                  Signing up under Affiliate ID: <b>{referralCode}</b>
                </p>
              )}

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
