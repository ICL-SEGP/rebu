"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Pencil, PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/constants";

// Define Offer type
interface Offer {
  id: number;
  desc: string;
  affiliate_link: string;
  offer_started: string;
  offer_end: string;
  status: "scheduled" | "expired" | "active";
  rebate_percentage: string;
  item_cost: string; // Added item cost field
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/offers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch offers");

      const offers = (await res.json()).data;

      let fetchedOffers = await offers.map((offer: any) => ({
        id: offer.id,
        desc: offer.desc,
        affiliate_link: offer.affiliate_link,
        offer_started: offer.offer_start,
        offer_end: offer.offer_end,
        status: offer.status,
        rebate_percentage: parseFloat(offer.rebate_percentage).toFixed(2),
        item_cost: offer.item_cost || "", // Added item cost
      }));

      setOffers(fetchedOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filtered offers based on search
  const filteredOffers = offers.filter(
    (offer) =>
      offer.affiliate_link.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        console.log("selected", selectedOffer)

        const res = await fetch(`${API_BASE_URL}/api/admin/offers`, {
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

        const res = await fetch(`${API_BASE_URL}/api/admin/offers/${selectedOffer.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(selectedOffer),
        });

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
      const res = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/offers/</span>{id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

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

  useEffect(() => {
    fetchOffers();
  }, []);

  const scheduledOffers = filteredOffers.filter((offer) => offer.status === "scheduled");
  const expiredOffers = filteredOffers.filter((offer) => offer.status === "expired");
  const activeOffers = filteredOffers.filter((offer) => offer.status === "active");

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Manage Offers</h1>

      {/* Search & Create Offer */}
      <div className="flex gap-4">
        <Input placeholder="Search offers..." value={searchQuery} onChange={handleSearch} className="w-1/3" />
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
            <DialogTitle>{selectedOffer?.id ? "Edit Offer" : "Create New Offer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={selectedOffer?.desc || ""}
                onChange={(e) => setSelectedOffer({ ...selectedOffer!, desc: e.target.value })}
                placeholder="Enter offer description"
              />
            </div>
            <div>
              <Label>Rebate %</Label>
              <Input
                name="rebate"
                value={selectedOffer?.rebate_percentage || ""}
                onChange={(e) => setSelectedOffer({ ...selectedOffer!, rebate_percentage: e.target.value })}
                placeholder="e.g., 20%"
              />
            </div>
            <div>
              <Label>Item Cost</Label>
              <Input
                name="item_cost"
                value={selectedOffer?.item_cost || ""}
                onChange={(e) => setSelectedOffer({ ...selectedOffer!, item_cost: e.target.value })}
                placeholder="e.g., 19.99"
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={selectedOffer?.status || "scheduled"}
                onChange={(e) => setSelectedOffer({ ...selectedOffer!, status: e.target.value as "scheduled" | "expired" | "active" })}
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
                  value={selectedOffer?.offer_started || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedOffer({ ...selectedOffer!, offer_started: e.target.value })}
                  className={`w-full p-2 border rounded ${selectedOffer?.status === "scheduled" && !selectedOffer?.offer_started ? "border-red-500" : "border-gray-300"}`}
                  min={selectedOffer?.status === "scheduled" ? new Date().toISOString().split("T")[0] : undefined}
                />
                {selectedOffer?.status === "scheduled" && !selectedOffer?.offer_started && (
                  <p className="text-xs text-red-600 mt-1">Required for scheduled offers</p>
                )}
                {selectedOffer?.status === "scheduled" && (
                  <p className="text-xs text-gray-600 mt-1">Must be in the future</p>
                )}
              </div>
              <div>
                <Label>Offer End</Label>
                <Input
                  type="date"
                  name="offer_end"
                  value={selectedOffer?.offer_end || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedOffer({ ...selectedOffer!, offer_end: e.target.value })}
                  className={`w-full p-2 border rounded ${selectedOffer?.status === "scheduled" && !selectedOffer?.offer_end ? "border-red-500" : selectedOffer?.offer_started && selectedOffer?.offer_end < selectedOffer?.offer_started ? "border-red-500" : "border-gray-300"}`}
                  min={selectedOffer?.status === "scheduled" ? new Date().toISOString().split("T")[0] : selectedOffer?.offer_started || undefined}
                />
                {selectedOffer?.status === "scheduled" && !selectedOffer?.offer_end && (
                  <p className="text-xs text-red-600 mt-1">Required for scheduled offers</p>
                )}
                {selectedOffer?.offer_started && selectedOffer?.offer_end < selectedOffer?.offer_started && (
                  <p className="text-xs text-red-600 mt-1">End date must be after start date</p>
                )}
                {selectedOffer?.status === "scheduled" && (
                  <p className="text-xs text-gray-600 mt-1">Must be in the future</p>
                )}
              </div>
            </div>
            <div>
              <Label>Affiliate Link</Label>
              <Input
                name="link"
                value={selectedOffer?.affiliate_link || ""}
                onChange={(e) => setSelectedOffer({ ...selectedOffer!, affiliate_link: e.target.value })}
                placeholder="https://affiliate.example.com"
              />
            </div>
            <Button className="w-full" onClick={selectedOffer?.id ? handleUpdateOffer : handleSaveOffer}>
              {selectedOffer?.id ? "Update Offer" : "Add Offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferSection({ title, offers, borderColor, handleEditOffer, handleDeleteOffer }: {
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
                <TableCell>{offer.rebate_percentage}</TableCell>
                <TableCell>{offer.item_cost}</TableCell>
                <TableCell>{offer.offer_started}</TableCell>
                <TableCell>{offer.offer_end}</TableCell>
                <TableCell>
                  <a href={offer.affiliate_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Visit
                  </a>
                </TableCell>
                <TableCell>{offer.status}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditOffer(offer)}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteOffer(offer.id)}>
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