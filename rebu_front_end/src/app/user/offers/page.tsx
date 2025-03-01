"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/modals/dialog";
import { Badge } from "@/components/ui/helpers/badge";
import { API_BASE_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";

// // Define the structure of an offer (TypeScript type safety)
interface Offer {
  id: string;
  desc: string;
  affiliate_link: string;
  offer_started: string;
  offer_end: string;
  rebate_percentage: string; // e.g., "10% BTC Cashback"
}


const initialOffers = [
  {
    id: 1,
    desc: "Itaque et eligendi ipsa eligendi!",
    affiliate_link: "https://oconnell.com",
    offer_start: "2025-02-02T14:08:01",
    offer_end: "2025-02-10T23:11:37",
    rebate_percentage: "9.84%",
  },
  {
    id: 2,
    desc: "Reiciendis sed accusamus aliquid laboriosam.",
    affiliate_link: "https://lang.net",
    offer_start: "2025-02-03T19:41:32",
    offer_end: "2025-02-10T00:43:35",
    rebate_percentage: "7.54%",
  },
  {
    id: 3,
    desc: "Limited-time deal! Save big today.",
    affiliate_link: "https://limiteddeal.com",
    offer_start: "2025-02-05T10:15:30",
    offer_end: "2025-02-08T18:30:00",
    rebate_percentage: "12.50%",
  },
];

export default function OffersList() {
  const [selectedOffer, setSelectedOffer] = useState(null);
  // const [offers, setOffers] = useState(initialOffers);
  const [sortBy, setSortBy] = useState("endingSoonest");
  const [offers, setOffers] = useState<Offer[]>([]);
  const { data: session } = useSession();

  const fetchOffers = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/offers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch balance");

      const offers = (await res.json()).data;

      let fetchedOffers= await offers.map((offer) => ({
        id: offer.id,
        desc: offer.desc,
        affiliate_link: offer.affiliate_link,
        offer_started: offer.offer_start,
        offer_end: offer.offer_end,
        rebate_percentage: parseFloat(offer.rebate_percentage).toFixed(2)
      }))


      setOffers(fetchedOffers);


    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Sorting Function
  const sortOffers = (criteria: string) => {
    let sortedOffers = [...offers];

    switch (criteria) {
      case "endingSoonest":
        sortedOffers.sort(
          (a, b) => new Date(a.offer_end).getTime() - new Date(b.offer_end).getTime()
        );
        break;
      case "highestRebate":
        sortedOffers.sort(
          (a, b) => parseFloat(b.rebate_percentage) - parseFloat(a.rebate_percentage)
        );
        break;
      case "newest":
        sortedOffers.sort(
          (a, b) => new Date(b.offer_started).getTime() - new Date(a.offer_started).getTime()
        );
        break;
      default:
        break;
    }

    setSortBy(criteria);
    setOffers(sortedOffers);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-center">Rebate Offers</h1>

      {/* Sorting Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          size="sm"
          variant={sortBy === "endingSoonest" ? "default" : "outline"}
          onClick={() => sortOffers("endingSoonest")}
        >
          Ending Soonest
        </Button>
        <Button
          size="sm"
          variant={sortBy === "highestRebate" ? "default" : "outline"}
          onClick={() => sortOffers("highestRebate")}
        >
          Highest Rebate
        </Button>
        <Button
          size="sm"
          variant={sortBy === "newest" ? "default" : "outline"}
          onClick={() => sortOffers("newest")}
        >
          Newest
        </Button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <Card key={offer.id} className="border shadow-md p-4 flex flex-col justify-between">
            <CardHeader>
              <CardTitle>{offer.desc}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p>
                <Badge className="bg-blue-500">{offer.rebate_percentage} Rebate</Badge>
              </p>
              <p className="text-sm text-gray-500">Starts: {new Date(offer.offer_started).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Ends: {new Date(offer.offer_end).toLocaleDateString()}</p>

              {/* Dialog for Offer Details */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full" onClick={() => setSelectedOffer(offer)}>
                    View Details
                  </Button>
                </DialogTrigger>

                {selectedOffer && selectedOffer.id === offer.id && (
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Offer Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-lg font-semibold">{selectedOffer.desc}</p>
                      <p className="text-gray-500">
                        Rebate: <Badge className="bg-green-500">{selectedOffer.rebate_percentage}</Badge>
                      </p>
                      <p>Offer starts on: {new Date(selectedOffer.offer_started).toLocaleString()}</p>
                      <p>Offer ends on: {new Date(selectedOffer.offer_end).toLocaleString()}</p>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                        <a href={selectedOffer.affiliate_link} target="_blank" rel="noopener noreferrer">
                          Buy with Offer
                        </a>
                      </Button>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}