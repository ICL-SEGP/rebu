"use client";

import { signIn } from "next-auth/react";
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setToken, returnToken } from "@/app/token";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // try {
    //   const res = await fetch("https://possible-thankfully-shrew.ngrok-free.app/api/sign-in", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ password, email}),
    //   });
  
    //   // Check if the response is ok
    //   if (!res.ok) {
    //     const errorText = await res.text(); // Get the error details as text
    //     console.error("Server error:", errorText);
    //     throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
    //   }
  
    //   // Parse the JSON response
    //   const data = await res.json();
      
    //   setToken(data.token)
    //   console.log(returnToken())
    //   console.log("Response data:", data);
    // } catch (error) {
    //   console.error("Error during fetch:", error);
    // }

    // // const response = post
    // const result = await signIn("credentials", {
    //   email,
    //   password,
    //   redirect: false,
    // });

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard"); // Redirect to home or dashboard on success
    }


    // router.push("/dashboard");
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
                <Input id="email" placeholder="user@gmail.com" onChange={(e) => setEmail(e.target.value)}/>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="*******" type="password" onChange={(e) => setPassword(e.target.value)}/>
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
                  onClick={() => router.push("/auth/register")}
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
