"use client";
import { signOut } from "next-auth/react";


const LogOutPage = () => {
    const handleLogout = async () => {

        await signOut({callbackUrl: "https://main.d227h8ee1xlxct.amplifyapp.com/"});
    };
    handleLogout();
    return (<div>Logging out</div>);
}

export default LogOutPage;