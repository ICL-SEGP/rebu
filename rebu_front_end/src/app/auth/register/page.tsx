"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn} from "next-auth/react";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/constants";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");

  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(JSON.stringify({ password, email, first_name, last_name }))

    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email, first_name, last_name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }


      // Optional: Auto-login after registration
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false, // Prevents full page reload
      });

      if (result?.error) {
        setError(result.error);
      } else {
        const session = await getSession();
        if (session) {
          if (session.role == "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/user/dashboard");
          }
        }; // Redirect to protected page
      }
    } catch (err: any) {
      setError(err.message);
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
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="John" onChange={(e) => setFirstName(e.target.value)}/>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name2" placeholder="Kerr" onChange={(e) => setLastName(e.target.value)}/>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="john.smith@gmail.com" onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="********" type="password" onChange={(e) => setPassword(e.target.value)}/>
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
                  onClick={() => router.push("/auth/login")}
                  className="text-blue-500 hover:underline"
                >
                  Login here
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
