"use client";

import { useEffect } from "react";
import { useMakePurchase } from "@/lib/api/solana";

export default function TestPage() {
  const { mutate: makePurchase } = useMakePurchase();

  useEffect(() => {
    makePurchase({ seller_str: "CSWoyRACpM1tFJaCAZGKqytMjCXrT6iWJgkgpPHRZCPx", productId: 2 });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold">Check the console for a test log!</h1>
    </div>
  );
}