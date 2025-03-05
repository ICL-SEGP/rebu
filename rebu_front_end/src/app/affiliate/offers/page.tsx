"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/tables/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modals/dialog";
import { Label } from "@/components/ui/forms/label";
import { Input } from "@/components/ui/forms/input";
import { Textarea } from "@/components/ui/forms/textarea";
import { Trash2, Pencil, PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { getAffiliateOffers } from "@/lib/api/affiliate";
import { getAllOffers } from "@/lib/api/user";
import { Offer, OfferStatus, OrderStatus } from "@/types/app";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer>();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    status,
    error,
    data: offersList,
  } = useQuery({
    queryKey: ["affiliate-offers"],
    queryFn: () => getAffiliateOffers(session!.accessToken),
  });

  useEffect(() => {
    if (offersList) {
      setOffers(offersList);
    }
  }, [offersList]);



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filtered offers based on search
  const filteredOffers = offers.filter(
    (offer) =>
      offer.affiliateLink.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open edit modal
  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsDialogOpen(true);
  };

  // Save edited offer
  const handleSaveOffer = async () => {
    if (selectedOffer) {
      try {
        console.log("selected", selectedOffer);

        const res = await fetch(`${API_BASE_URL}/api/affiliate/offers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(selectedOffer),
        });

        if (!res.ok) throw new Error(`Failed to create offer`);

        fetchOffers(); // Refetch offers after successful operation
        setIsDialogOpen(false); // Close the dialog
      } catch (error) {
        console.error("Error saving offer:", error);
      }
    }
  };

  const handleUpdateOffer = async () => {
    if (selectedOffer) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/affiliate/offers/${selectedOffer.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify(selectedOffer),
          }
        );

        if (!res.ok) throw new Error(`Failed toupdate offer`);

        fetchOffers(); // Refetch offers after successful operation
        setIsDialogOpen(false); // Close the dialog
      } catch (error) {
        console.error("Error saving offer:", error);
      }
    }
  };

  // Delete offer
  const handleDeleteOffer = (id: number) => {
    if (window.confirm(`Are you sure you want to delete Offer #${id}?`)) {
      setOffers(offers.filter((offer) => offer.id !== id));
      deleteOffer(id);
    }
  };

  const deleteOffer = async (id) => {
    try {
      const res = await fetch(
        `<span class="math-inline">\{API\_BASE\_URL\}/api/offers/</span>{id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete offer");
    } catch (error) {
      console.error("Error deleting offer:", error);
    }
  };

  // Open create offer modal
  const handleCreateOffer = () => {
    setSelectedOffer({
      id: 0, // 0 indicates a new offer
      desc: "",
      affiliate_link: "",
      offer_started: new Date().toISOString().split("T")[0],
      offer_end: new Date().toISOString().split("T")[0],
      status: "scheduled",
      rebate_percentage: "",
      item_cost: "", // Initialize item cost
    });
    setIsDialogOpen(true);
  };



  const scheduledOffers = filteredOffers.filter(
    (offer) => offer.status === OfferStatus.SCHEDULED
  );
  const expiredOffers = filteredOffers.filter(
    (offer) => offer.status === OfferStatus.EXPIRED
  );
  const activeOffers = filteredOffers.filter(
    (offer) => offer.status === OfferStatus.EXPIRED
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Manage Offers</h1>

      {/* Search & Create Offer */}
      <div className="flex gap-4">
        <Input
          placeholder="Search offers..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/3"
        />
        <Button className="flex items-center gap-2" onClick={handleCreateOffer}>
          <PlusCircle size={18} /> Add New Offer
        </Button>
      </div>

      {/* Offers Table */}
      {scheduledOffers.length > 0 && (
        <OfferSection
          title="Scheduled Offers"
          offers={scheduledOffers}
          borderColor="border-orange-500"
          handleEditOffer={handleEditOffer}
          handleDeleteOffer={handleDeleteOffer}
        />
      )}

      {activeOffers.length > 0 && (
        <OfferSection
          title="Active Offers"
          offers={activeOffers}
          borderColor="border-green-500"
          handleEditOffer={handleEditOffer}
          handleDeleteOffer={handleDeleteOffer}
        />
      )}

      {expiredOffers.length > 0 && (
        <OfferSection
          title="Expired Offers"
          offers={expiredOffers}
          borderColor="border-red-500"
          handleEditOffer={handleEditOffer}
          handleDeleteOffer={handleDeleteOffer}
        />
      )}

      {/* Edit/Create Offer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOffer?.id ? "Edit Offer" : "Create New Offer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={selectedOffer?.desc || ""}
                onChange={(e) =>
                  setSelectedOffer({ ...selectedOffer!, desc: e.target.value })
                }
                placeholder="Enter offer description"
              />
            </div>
            <div>
              <Label>Rebate %</Label>
              <Input
                name="rebate"
                value={selectedOffer?.rebatePercentage || ""}
                onChange={(e) =>
                  setSelectedOffer({
                    ...selectedOffer!,
                    rebatePercentage: Number(e.target.value),
                  })
                }
                placeholder="e.g., 20%"
              />
            </div>
            <div>
              <Label>Item Cost</Label>
              <Input
                name="item_cost"
                value={selectedOffer?.itemCost || ""}
                onChange={(e) =>
                  setSelectedOffer({
                    ...selectedOffer!,
                    itemCost: Number(e.target.value),
                  })
                }
                placeholder="e.g., 19.99"
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={selectedOffer?.status || "scheduled"}
                onChange={(e) =>
                  setSelectedOffer({
                    ...selectedOffer!,
                    status: e.target.value as OfferStatus,
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Offer Starts</Label>
                <Input
                  type="date"
                  name="offer_started"
                  value={
                    selectedOffer?.offerStart.toISOString().split("T")[0] ||
                    new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setSelectedOffer({
                      ...selectedOffer!,
                      offerStart: new Date(e.target.value),
                    })
                  }
                  className={`w-full p-2 border rounded ${
                    selectedOffer?.status === OfferStatus.SCHEDULED &&
                    !selectedOffer?.offerStart
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  min={
                    selectedOffer?.status === OfferStatus.SCHEDULED
                      ? new Date().toISOString().split("T")[0]
                      : undefined
                  }
                />
                {selectedOffer?.status === OfferStatus.SCHEDULED &&
                  !selectedOffer?.offerStart && (
                    <p className="text-xs text-red-600 mt-1">
                      Required for scheduled offers
                    </p>
                  )}
                {selectedOffer?.status === OfferStatus.SCHEDULED && (
                  <p className="text-xs text-gray-600 mt-1">
                    Must be in the future
                  </p>
                )}
              </div>
              <div>
                <Label>Offer End</Label>
                <Input
                  type="date"
                  name="offer_end"
                  value={
                    selectedOffer?.offerEnd.toISOString().split("T")[0] ||
                    new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setSelectedOffer({
                      ...selectedOffer!,
                      offerEnd: new Date(e.target.value),
                    })
                  }
                  className={`w-full p-2 border rounded ${
                    selectedOffer?.status === "scheduled" &&
                    !selectedOffer?.offerEnd
                      ? "border-red-500"
                      : selectedOffer?.offerStart &&
                        selectedOffer?.offerEnd < selectedOffer?.offerStart
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  min={
                    selectedOffer?.status === "scheduled"
                      ? new Date().toISOString().split("T")[0]
                      : selectedOffer?.offerStart.toISOString().split("T")[0] ||
                        undefined
                  }
                />
                {selectedOffer?.status === "scheduled" &&
                  !selectedOffer?.offerEnd && (
                    <p className="text-xs text-red-600 mt-1">
                      Required for scheduled offers
                    </p>
                  )}
                {selectedOffer?.offerStart &&
                  selectedOffer?.offerEnd < selectedOffer?.offerStart && (
                    <p className="text-xs text-red-600 mt-1">
                      End date must be after start date
                    </p>
                  )}
                {selectedOffer?.status === "scheduled" && (
                  <p className="text-xs text-gray-600 mt-1">
                    Must be in the future
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label>Affiliate Link</Label>
              <Input
                name="link"
                value={selectedOffer?.affiliateLink || ""}
                onChange={(e) =>
                  setSelectedOffer({
                    ...selectedOffer!,
                    affiliateLink: e.target.value,
                  })
                }
                placeholder="https://affiliate.example.com"
              />
            </div>
            <Button
              className="w-full"
              onClick={selectedOffer?.id ? handleUpdateOffer : handleSaveOffer}
            >
              {selectedOffer?.id ? "Update Offer" : "Add Offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferSection({
  title,
  offers,
  borderColor,
  handleEditOffer,
  handleDeleteOffer,
}: {
  title: string;
  offers: Offer[];
  borderColor: string;
  handleEditOffer: (offer: Offer) => void;
  handleDeleteOffer: (id: number) => void;
}) {
  return (
    <Card className={`border-2 ${borderColor} rounded-lg shadow-lg mb-4`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Rebate</TableHead>
              <TableHead>Item Cost</TableHead>
              <TableHead>Offer Starts</TableHead>
              <TableHead>Offer end</TableHead>
              <TableHead>Affiliate Link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>{offer.desc}</TableCell>
                <TableCell>{offer.rebatePercentage}</TableCell>
                <TableCell>{offer.itemCost}</TableCell>
                <TableCell>{offer.offerStart.toISOString().split("T")[0]}</TableCell>
                <TableCell>{offer.offerEnd.toISOString().split("T")[0]}</TableCell>
                <TableCell>
                  <a
                    href={offer.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Visit
                  </a>
                </TableCell>
                <TableCell>{offer.status}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditOffer(offer)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteOffer(offer.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
