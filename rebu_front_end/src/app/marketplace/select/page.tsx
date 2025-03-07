"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import { ShoppingCart, Store } from "lucide-react";

export default function MarketplaceSelect() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
<div className="flex flex-col items-center h-[90vh] px-6 pt-32 space-y-8">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        {/* Seller Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-all border border-gray-200 p-6 text-center"
          onClick={() => router.push(`/marketplace/seller`)}
        >
          <CardHeader className="flex flex-col items-center space-y-2">
            <Store className="w-16 h-16 text-gray-800" />
            <CardTitle className="text-xl font-semibold">Seller</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="mt-3 w-full bg-black text-white hover:bg-gray-900">
              Sell Products
            </Button>
          </CardContent>
        </Card>

        {/* Buyer Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-all border border-gray-200 p-6 text-center"
          onClick={() => router.push(`/marketplace/buyer`)}
        >
          <CardHeader className="flex flex-col items-center space-y-2">
            <ShoppingCart className="w-16 h-16 text-gray-800" />
            <CardTitle className="text-xl font-semibold">Buyer</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="mt-3 w-full bg-black text-white hover:bg-gray-900">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
