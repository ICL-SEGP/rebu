"use client";

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

// Hardcoded affiliate offers
const offers = [
  {
    id: "1",
    product: "Crypto Trading Platform",
    affiliate: "Binance",
    cryptoRebate: "10% BTC Cashback",
    purchaseLink: "https://binance.com/referral",
  },
  {
    id: "2",
    product: "VPN Service",
    affiliate: "NordVPN",
    cryptoRebate: "15% ETH Discount",
    purchaseLink: "https://nordvpn.com/crypto-offer",
  },
  {
    id: "3",
    product: "Hardware Wallet",
    affiliate: "Ledger",
    cryptoRebate: "5% USDT Rebate",
    purchaseLink: "https://ledger.com/affiliate",
  },
  {
    id: "4",
    product: "Cloud Mining Service",
    affiliate: "Genesis Mining",
    cryptoRebate: "20% LTC Discount",
    purchaseLink: "https://genesis-mining.com",
  },
  {
    id: "5",
    product: "Crypto Debit Card",
    affiliate: "Crypto.com",
    cryptoRebate: "2% CRO Cashback",
    purchaseLink: "https://crypto.com/card",
  },
];

export default function OffersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Affiliate Offers with Crypto Rebates</h1>

      {/* Table for listing offers */}
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
          {offers.map((offer) => (
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
          ))}
        </TableBody>
      </Table>

      {/* Featured Offers Section */}
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
