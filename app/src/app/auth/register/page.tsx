"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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


// export async function fetchWithToken(url:string, token:string) {
//   const response = await fetch(url, {
//     method: 'GET', // or 'POST', etc.
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch');
//   }

//   return response.json();
// }

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
    // const res = await fetch("https://possible-thankfully-shrew.ngrok-free.app/api/register");
    console.log(
      JSON.stringify({
        password,
        email,
        first_name,
        last_name,
      })
    );
  
    try {
      const res = await fetch("http://176.34.210.163:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email, first_name, last_name }),
      });
  
      // Check if the response is ok
      if (!res.ok) {
        const errorText = await res.text(); // Get the error details as text
        console.error("Server error:", errorText);
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
      }
  
      // Parse the JSON response
      // const data = await res.json();
      // setToken(data.token)
      // console.log(returnToken())
      // console.log("Response data:", data);
    } catch (error) {
      console.error("Error during fetch:", error);
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message || "Something went wrong.");
      return;
    }
    router.push("/auth/login")

    // router.push("/dashboard");
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
