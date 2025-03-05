"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/modals/dialog";
import { Badge } from "@/components/ui/helpers/badge";
import { API_BASE_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getAllOffers } from "@/lib/api/user";
import { Offer } from "@/types/app";

export default function offersPage() {
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer>();
  const [sortBy, setSortBy] = useState("endingSoonest");

  // TODO check for errors on the api response here
  const {
    status,
    error,
    data: offersList,
  } = useQuery({
    queryKey: ["offers"],
    queryFn: () => getAllOffers(session!.accessToken),
  });

  useEffect(() => {
    if (offersList) {
      setOffers(offersList);
    }
  }, [offersList]);

  // Sorting Function
  const sortOffers = (criteria: string) => {
    let sortedOffers = [...offers];

    switch (criteria) {
      case "endingSoonest":
        sortedOffers.sort(
          (a, b) => a.offerEnd.getTime() - b.offerEnd.getTime()
        );
        break;
      case "highestRebate":
        sortedOffers.sort((a, b) => b.rebatePercentage - a.rebatePercentage);
        break;
      case "newest":
        sortedOffers.sort(
          (a, b) => b.offerStart.getTime() - a.offerStart.getTime()
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
          <Card
            key={offer.id}
            className="border shadow-md p-4 flex flex-col justify-between"
          >
            <CardHeader>
              <CardTitle>{offer.desc}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Badge className="bg-blue-500">
                {offer.rebatePercentage} Rebate
              </Badge>
              <p className="text-sm text-gray-500">
                Starts: {offer.offerStart.toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Ends: {offer.offerEnd.toLocaleDateString()}
              </p>

              {/* Dialog for Offer Details */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedOffer(offer)}
                  >
                    View Details
                  </Button>
                </DialogTrigger>

                {selectedOffer && selectedOffer.id === offer.id && (
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Offer Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-lg font-semibold">
                        {selectedOffer.desc}
                      </p>
                      <p className="text-gray-500">Rebate: </p>
                      <Badge className="bg-green-500">
                        {selectedOffer.rebatePercentage}
                      </Badge>
                      <p>
                        Offer starts on:{" "}
                        {selectedOffer.offerStart.toLocaleString()}
                      </p>
                      <p>
                        Offer ends on: {selectedOffer.offerEnd.toLocaleString()}
                      </p>

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        asChild
                      >
                        <a
                          href={selectedOffer.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
