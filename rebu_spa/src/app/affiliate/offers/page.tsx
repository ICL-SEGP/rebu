"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui//table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Offer, OfferStatus } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import clsx from "clsx";

import { DateTimePicker } from "@/components/owned/datetime-picker";
import toast from "react-hot-toast";

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

  function checkOfferDates(selectedOffer: any) {
    if (selectedOffer) {
      const now = Date.now();

      // Check for future offer and not scheduled
      if (selectedOffer.offerStart) {
        const offerStartTime = new Date(selectedOffer.offerStart).getTime();
        const inFiveMins = now + 4 * 60000; // 60000 milliseconds = 1 minute

        if (
          offerStartTime > inFiveMins &&
          selectedOffer.status != OfferStatus.SCHEDULED
        ) {
          toast.error("Offers in the future must be marked as scheduled.", {
            id: "needs-scheduled",
          });
          return false; // Exit to prevent further checks if this condition is met
        }

        if (
          offerStartTime < inFiveMins &&
          selectedOffer.status == OfferStatus.SCHEDULED
        ) {
          toast.error("Offers scheduled must be in at least 5mins.", {
            id: "needs-scheduled-5min",
          });
          return false; // Exit to prevent further checks if this condition is met
        }
      }

      // Check for past offer and not expired
      if (selectedOffer.offerEnd) {
        const offerEndTime = new Date(selectedOffer.offerEnd).getTime();

        if (offerEndTime > now && selectedOffer.status == OfferStatus.EXPIRED) {
          toast.error("Offers marked expired must be in the past.", {
            id: "needs-expired-past",
          });
          return false;
        }

        if (
          offerEndTime < now &&
          !(selectedOffer.status == OfferStatus.EXPIRED)
        ) {
          toast.error("Offers in the past must be marked as expired.", {
            id: "needs-expired",
          });
          return false;
        }
      }
      return true;
    }
  }
  // Save edited offer
  const handleCreateOffer = async () => {
    if (!selectedOffer) return;

    if (!checkOfferDates(selectedOffer)) {
      return;
      console.log("check offer rets", checkOfferDates(selectedOffer));
    }

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
      toast.success("Created new offer!");
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

    if (!checkOfferDates(selectedOffer)) {
      return;
    }

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
      toast.success("Updated existing offer!");
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
            <PlusCircle size={18} /> New Offer
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
                value={selectedOffer?.status || ""}
                onChange={(e) =>
                  setSelectedOffer({
                    ...selectedOffer!,
                    status: e.target.value as OfferStatus,
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Offer Starts</Label>
                <DateTimePicker
                  value={
                    selectedOffer?.status === OfferStatus.ACTIVE
                      ? (() => {
                          if (selectedOffer) {
                            selectedOffer.offerStart = new Date();
                            return selectedOffer.offerStart;
                          }
                          return undefined; // Or handle the case where selectedOffer is undefined
                        })()
                      : selectedOffer?.offerStart
                  }
                  min={
                    selectedOffer?.status === OfferStatus.SCHEDULED
                      ? new Date()
                      : undefined
                  }
                  onChange={(date) =>
                    setSelectedOffer({ ...selectedOffer!, offerStart: date })
                  }
                  timePicker={{ hour: true, minute: true, second: false }}
                  clearable={true}
                />

                {selectedOffer?.status === OfferStatus.SCHEDULED && (
                  <p className="text-xs text-gray-600 mt-1">
                    Must be in the future
                  </p>
                )}
              </div>
              <div>
                <Label>Offer Ends </Label>
                <DateTimePicker
                  value={
                    selectedOffer?.offerStart > selectedOffer?.offerEnd
                      ? undefined
                      : selectedOffer?.offerEnd
                  }
                  min={selectedOffer?.offerStart}
                  onChange={(date) =>
                    setSelectedOffer({ ...selectedOffer!, offerEnd: date })
                  }
                  timePicker={{ hour: true, minute: true, second: false }}
                  clearable={true}
                />
                {selectedOffer?.status === OfferStatus.SCHEDULED && (
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
        />
      )}

      {activeOffers.length > 0 && (
        <OfferSection
          title="Active Offers"
          offers={activeOffers}
          borderColor="border-green-500"
          handleEditOffer={handleEditOffer}
        />
      )}

      {expiredOffers.length > 0 && (
        <OfferSection
          title="Expired Offers"
          offers={expiredOffers}
          borderColor="border-red-500"
          handleEditOffer={handleEditOffer}
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
                    href={
                      offer.affiliateLink?.startsWith("http://") ||
                      offer.affiliateLink?.startsWith("https://")
                        ? offer.affiliateLink
                        : `https://${offer.affiliateLink}`
                    }
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

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
