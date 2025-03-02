"use client";
import { API_BASE_URL } from "@/lib/constants";
import { signOut, useSession } from "next-auth/react";


const SignOutPage = () => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    if (!session) {
      console.error("No user logged in.");
      return;
    }

    await fetch(`${API_BASE_URL}/api/logout`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    await signOut({ callbackUrl: "https://main.d227h8ee1xlxct.amplifyapp.com/" });
  };

  handleSignOut();
  return (<div>Logging out</div>);
}

export default SignOutPage;