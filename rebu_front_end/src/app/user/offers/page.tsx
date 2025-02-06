"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the structure of an offer (TypeScript type safety)
interface Offer {
  id: string;
  product: string;
  affiliate: string;
  cryptoRebate: string; // e.g., "10% BTC Cashback"
  purchaseLink: string;
}

// Backend API endpoint (Replace with actual API)
const API_URL = "/api/offers";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch offers from backend
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch offers");

      const data: Offer[] = await response.json();
      setOffers(data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch offers on mount
  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Affiliate Offers with Crypto Rebates</h1>

      {/* Display Offers in a Table */}
      <Table className="w-full border rounded-lg shadow-md">
        <TableCaption>Exclusive affiliate offers with crypto rebates</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="px-4 py-3">Product</TableHead>
            <TableHead className="px-4 py-3">Affiliate</TableHead>
            <TableHead className="px-4 py-3">Crypto Rebate</TableHead>
            <TableHead className="text-right px-4 py-3">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                Loading offers...
              </TableCell>
            </TableRow>
          ) : offers.length > 0 ? (
            offers.map((offer) => (
              <TableRow key={offer.id} className="hover:bg-gray-50 transition">
                <TableCell className="font-medium px-4 py-2">{offer.product}</TableCell>
                <TableCell className="px-4 py-2">{offer.affiliate}</TableCell>
                <TableCell className="px-4 py-2">
                  <Badge className="bg-blue-100 text-blue-700">{offer.cryptoRebate}</Badge>
                </TableCell>
                <TableCell className="text-right px-4 py-2">
                  <a
                    href={offer.purchaseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Offer
                  </a>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                No offers available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Display Featured Offers as Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.slice(0, 3).map((offer) => (
          <Card key={offer.id}>
            <CardHeader>
              <CardTitle>{offer.product}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Affiliate: {offer.affiliate}</p>
              <p className="text-lg font-semibold mt-2">{offer.cryptoRebate}</p>
              <a
                href={offer.purchaseLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                View Offer
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
