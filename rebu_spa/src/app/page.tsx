"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession(); // Access session information
  const router = useRouter();

  useEffect(() => {
    if (session) {
      if (session.user.role == "affiliate") {
        router.push("/affiliate/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } else {
      router.push("/sign-in");
    }
  }, [session, router]);

  return null;
}
