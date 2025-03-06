"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/modals/dialog";
import { Label } from "@/components/ui/forms/label";
import { Input } from "@/components/ui/forms/input";
import { Textarea } from "@/components/ui/forms/textarea";
import { Trash2, Pencil, PlusCircle, CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import {
  createOffer,
  getAffiliateOffers,
  updateOffer,
} from "@/lib/api/affiliate";
import { getAllOffers } from "@/lib/api/user";
import { Offer, OfferStatus, OrderStatus } from "@/types/app";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/forms/popover";
import { Calendar } from "@/components/ui/helpers/calendar";
import { format } from "date-fns";
import clsx from "clsx";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

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
      console.log(offersList);
    }
  }, [offersList]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const [statusFilter, setStatusFilter] = useState<OfferStatus>(
    OfferStatus.ALL
  );

  const handleFilterStatus = (status: OfferStatus) => {
    setStatusFilter(status);
  };

  // Filtered offers based on search
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        offer.affiliateLink.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === OfferStatus.ALL || offer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [offers, searchQuery, statusFilter]);

  // Open edit modal
  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setOpen(true);
  };

  // Save edited offer
  const handleCreateOffer = async () => {
    console.log(selectedOffer);
    if (!selectedOffer) return;

    if (
      !window.confirm(
        `Are you sure you want to create Offer #${selectedOffer.id}?`
      )
    ) {
      return;
    }

    try {
      const createdOffer = await createOffer(
        session!.accessToken,
        selectedOffer
      );

      console.log(createdOffer);

      setOffers((prevOffers: Offer[]) => [createdOffer, ...prevOffers]);

      setSelectedOffer(null);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  const handleUpdateOffer = async () => {
    console.log(selectedOffer);
    if (!selectedOffer) return;

    if (
      !window.confirm(
        `Are you sure you want to update Offer #${selectedOffer.id}?`
      )
    ) {
      return;
    }

    try {
      const updatedOffer = await updateOffer(
        session!.accessToken,
        selectedOffer
      );

      console.log(updatedOffer);

      setOffers((prevOffers: Offer[]) =>
        prevOffers.map((offer) =>
          offer.id === selectedOffer.id ? selectedOffer : offer
        )
      );

      setOpen(false);
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  // Delete offer
  const handleDeleteOffer = (id: number) => {
    // if (window.confirm(`Are you sure you want to delete Offer #${id}?`)) {
    //   setOffers(offers.filter((offer) => offer.id !== id));
    //   deleteOffer(id);
    // }
  };

  // const deleteOffer = async (id) => {
  //   try {
  //     const res = await fetch(
  //       `<span class="math-inline">\{API\_BASE\_URL\}/api/offers/</span>{id}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${session.accessToken}`,
  //         },
  //       }
  //     );

  //     if (!res.ok) throw new Error("Failed to delete offer");
  //   } catch (error) {
  //     console.error("Error deleting offer:", error);
  //   }
  // };

  const scheduledOffers = filteredOffers.filter(
    (offer) => offer.status === OfferStatus.SCHEDULED
  );
  const expiredOffers = filteredOffers.filter(
    (offer) => offer.status === OfferStatus.EXPIRED
  );
  const activeOffers = filteredOffers.filter(
    (offer) => offer.status === OfferStatus.ACTIVE
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
        <Select
          value={statusFilter}
          onValueChange={(value) => handleFilterStatus(value as OfferStatus)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent defaultValue={"all"}>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => setSelectedOffer(null)}
          >
            <PlusCircle size={18} /> New Order
          </Button>
        </DialogTrigger>
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
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={clsx(
                        "w-full justify-start text-left font-normal",
                        selectedOffer?.status === OfferStatus.SCHEDULED &&
                          !selectedOffer?.offerStart
                          ? "border-red-500"
                          : "border-gray-300"
                      )}
                    >
                      {selectedOffer?.offerStart
                        ? format(selectedOffer.offerStart, "PPP")
                        : "Pick a date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    forceMount
                    className="z-[9999] w-auto p-0 bg-white shadow-lg"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedOffer?.offerStart}
                      onSelect={(date) =>
                        setSelectedOffer({
                          ...selectedOffer!,
                          offerStart: date ?? new Date(),
                        })
                      }
                      disabled={(date) =>
                        selectedOffer?.status === OfferStatus.SCHEDULED &&
                        date < new Date()
                      }
                    />
                  </PopoverContent>
                </Popover>
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
              onClick={
                selectedOffer?.id ? handleUpdateOffer : handleCreateOffer
              }
            >
              {selectedOffer?.id ? "Update Offer" : "Add Offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <TableHead>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>{offer.desc}</TableCell>
                <TableCell>{offer.rebatePercentage}</TableCell>
                <TableCell>{offer.itemCost}</TableCell>
                <TableCell>
                  {offer.offerStart.toISOString().split("T")[0]}
                </TableCell>
                <TableCell>
                  {offer.offerEnd.toISOString().split("T")[0]}
                </TableCell>
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
                  {/* <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteOffer(offer.id)}
                  >
                    <Trash2 size={16} />
                  </Button> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
