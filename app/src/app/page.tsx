"use client"; // Add this to make it a Client Component

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession(); // Access session information
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard"); // Redirect logged-in users to dashboard
    }
  }, [session, router]);

  if (session) {
    return null; // Prevent rendering if redirecting
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Rewards Platform</h1>
      <p className="mb-6">Sign in or register to access your dashboard.</p>
      <div className="flex space-x-4">
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/auth/register")}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
}
