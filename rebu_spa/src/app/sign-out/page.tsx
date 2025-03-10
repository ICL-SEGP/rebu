"use client";

import { API_BASE_URL } from "@/lib/constants";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

const SignOutPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      if (!session) {
        router.push("/sign-in");
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/sign-out`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        await signOut({
          callbackUrl: "https://main.d227h8ee1xlxct.amplifyapp.com/",
          redirect: false,
        });

        toast.success("Thank you for using Rebu!", { id: "signed-out" });
        router.push("/sign-in");
      } catch (error) {
        console.error("Sign-out error:", error);
        toast.error("Sign-out failed. Please try again.", {
          id: "sign-out_error",
        });
      }
    };

    handleSignOut();
  }, [session, router]);

  return null;
};

export default SignOutPage;
