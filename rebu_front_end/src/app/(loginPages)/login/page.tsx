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
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import { useSession } from "next-auth/react";
import { useEffect } from "react";



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Attempts sign in with credentials
    console.log("creds", email, password)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log(res)
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      const session = await getSession();
      sessionStorage.setItem("fromSignIn", "true");
      if (session) {
        if (session.user.role == "affiliate") {
          router.push("/affiliate/dashboard");
        } else {
          router.push("/user/dashboard");
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription>
            <Label className="text-red-500">{error}</Label>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="user@gmail.com" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="*******" type="password" onChange={(e) => setPassword(e.target.value)} />
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

export default Login;
