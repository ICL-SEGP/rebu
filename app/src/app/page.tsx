"use client"; // Add this to make it a Client Component

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession(); // Access session information
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/user/dashboard"); // Redirect logged-in users to dashboard
    } else {
      router.push("/auth/login");
    }
  }, [session, router]);

  return null; 
}
