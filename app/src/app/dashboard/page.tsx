"use client";

import { useDashboard } from "@/context/DashboardContext";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { setToken, returnToken } from "@/app/token";


const DashboardPage = () => {
  const { availableTokens, lockedTokens, purchases } = useDashboard();

  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }
  const handleSubmit = async () => {
    try {
      const res = await fetch("https://possible-thankfully-shrew.ngrok-free.app/api/balance", {
        method: 'GET', // or 'POST', etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${returnToken()}`,
        },
      });
      // Check if the response is ok
      if (!res.ok) {
        const errorText = await res.text(); // Get the error details as text
        console.error("Server error:", errorText);
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
      }

      // Parse the JSON response
      const data = await res.json();
      setToken(data.token)
      console.log(returnToken())
      console.log("Response data:", data);
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  }
  

  const handleLogout = async () => {
    try {
      const res = await fetch("https://possible-thankfully-shrew.ngrok-free.app/api/sign-out", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log(res)
      if (!res.ok) {
        const errorText = await res.text(); // Get the error details as text
        console.error("Server error:", errorText);
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
      }
  
      // Parse the JSON response
      const data = await res.text();
      console.log(data)
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="w-full bg-blue-600 text-white py-4 px-6">
        <h1 className="text-2xl font-bold text-center">Rewards Dashboard</h1>
      </header>

      <main className="flex flex-col items-center justify-center mt-10 space-y-8 w-full px-8">
        {/* Token Summary */}
        <section className="flex flex-col w-full max-w-4xl p-4 bg-white shadow-md rounded-md">
          <h2 className="text-lg font-semibold mb-4">Token Summary</h2>
          <p>
            <span className="text-blue-600 font-bold">
              Available Tokens: {availableTokens}
            </span>
          </p>
          <p>
            <span className="text-red-600 font-bold">
              Locked Tokens: {lockedTokens}
            </span>
          </p>
        </section>

        {/* Transaction History */}
        <section className="flex flex-col w-full max-w-4xl p-4 bg-white shadow-md rounded-md">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          <ul>
            {purchases.length > 0 ? (
              purchases.map((purchase, index) => (
                <li
                  key={index}
                  className="flex justify-between border-b py-2 text-sm"
                >
                  <span>{purchase.date}</span>
                  <span>{purchase.product}</span>
                  <span className="font-bold">{purchase.amount}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No transactions yet.</p>
            )}
          </ul>
        </section>
      </main>

      {/* Logout Button */}
      <footer className="flex flex-col items-center w-full max-w-4xl mt-10">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
        >
          Logout
        </button>
      </footer>
    </div>
  );
};

export default DashboardPage;
