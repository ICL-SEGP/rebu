"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";

export default function MarketplaceSelect() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Choose Your Marketplace Role</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border border-gray-200"
          onClick={() => router.push("/affiliate/marketplace/seller")}
        >
          <CardHeader className="flex flex-col items-center p-6">
            <CardTitle className="text-xl font-semibold">Seller</CardTitle>
          </CardHeader>
          <CardContent className="text-center px-6 pb-6">
            <p className="text-gray-600">Manage and list products for sale.</p>
            <Button className="mt-4 w-full bg-black text-white hover:bg-gray-900">
              Continue as Seller
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-xl transition-all border border-gray-200"
          onClick={() => router.push("/affiliate/marketplace/buyer")}
        >
          <CardHeader className="flex flex-col items-center p-6">
            <CardTitle className="text-xl font-semibold">Buyer</CardTitle>
          </CardHeader>
          <CardContent className="text-center px-6 pb-6">
            <p className="text-gray-600">Browse and purchase products.</p>
            <Button className="mt-4 w-full bg-black text-white hover:bg-gray-900">
              Continue as Buyer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
