"use client";
import { signOut } from "next-auth/react";
import { API_BASE_URL } from "@/lib/constants";

const LogOutPage = () => {
    const handleLogout = async () => {

        await signOut({callbackUrl: API_BASE_URL});
    };
    handleLogout();
    return (<div>Logging out</div>);
}

export default LogOutPage;