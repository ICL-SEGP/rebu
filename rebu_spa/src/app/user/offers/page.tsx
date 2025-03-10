"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getAllOffers } from "@/lib/api/user";
import { Offer } from "@/types/types";
import { useRouter } from "next/navigation";

export default function offersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer>();
  const [sortBy, setSortBy] = useState("endingSoonest");
  const { data: session } = useSession();
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const router = useRouter();

  // TODO check for errors on the api response here
  const { data: offersList } = useQuery({
    queryKey: ["offers"],
    queryFn: () => getAllOffers(session!.accessToken),
  });

  useEffect(() => {
    if (offersList) {
      setOffers(offersList);
    }
    if (session?.user?.blocked) {
      setIsBlockedModalOpen(true);
    }
  }, [offersList, session]);

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
    <div className="relative">
      {isBlockedModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="absolute inset-0 bg-gray-200 bg-opacity-70 backdrop-filter backdrop-blur-sm"></div>
          <div className="bg-white p-8 rounded-lg shadow-lg mt-20 max-w-md relative z-10 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Access Restricted</h2>
            <p className="text-center">
              You cannot access affiliate offers as you are blocked. You can
              still use the marketplace and withdraw your tokens.
            </p>
            <Button
              className="mt-4 w-full md:w-auto transition-transform duration-200 hover:scale-105 active:scale-100"
              onClick={() =>
                session?.user.role === "affiliate"
                  ? router.push("/affiliate/dashboard")
                  : router.push("/user/dashboard")
              }
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      <div className={`space-y-6 p-6 ${isBlockedModalOpen ? "blur-sm" : ""}`}>
        <h1 className="text-3xl font-bold text-center">Rebate Offers</h1>

        {/* Sorting Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            size="sm"
            variant={sortBy === "endingSoonest" ? "default" : "outline"}
            onClick={() => sortOffers("endingSoonest")}
            className="transition-transform duration-200 hover:scale-105 active:scale-100"
          >
            Ending Soonest
          </Button>
          <Button
            size="sm"
            variant={sortBy === "highestRebate" ? "default" : "outline"}
            onClick={() => sortOffers("highestRebate")}
            className="transition-transform duration-200 hover:scale-105 active:scale-100"
          >
            Highest Rebate
          </Button>
          <Button
            size="sm"
            variant={sortBy === "newest" ? "default" : "outline"}
            onClick={() => sortOffers("newest")}
            className="transition-transform duration-200 hover:scale-105 active:scale-100"
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
                      className="w-full transition-transform duration-200 hover:scale-105 active:scale-100"
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
                          Offer ends on:{" "}
                          {selectedOffer.offerEnd.toLocaleString()}
                        </p>

                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 transition-transform duration-200 hover:scale-105 active:scale-100"
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
    </div>
  );
}
