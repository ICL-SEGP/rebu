"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, /*DialogTrigger*/ } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Pencil, PlusCircle } from "lucide-react";

// Define Offer type
interface Offer {
  id: number;
  title: string;
  description: string;
  rebate: string;
  link: string;
  createdAt: string;
}

// Hardcoded offers data
const initialOffers: Offer[] = [
  {
    id: 1,
    title: "50% Off Electronics",
    description: "Get 50% cashback on selected electronic items.",
    rebate: "50%",
    link: "https://affiliate.example.com/electronics",
    createdAt: "2024-02-01",
  },
  {
    id: 2,
    title: "20% Cashback on Clothing",
    description: "Earn 20% rebate on your favorite clothing brands.",
    rebate: "20%",
    link: "https://affiliate.example.com/clothing",
    createdAt: "2024-01-20",
  },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filtered offers based on search
  const filteredOffers = offers.filter(
    (offer) =>
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open edit modal
  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsDialogOpen(true);
  };

  // Save edited offer
  const handleSaveOffer = () => {
    if (selectedOffer) {
      setOffers(offers.map((offer) => (offer.id === selectedOffer.id ? selectedOffer : offer)));
      setIsDialogOpen(false);
    }
  };

  // Delete offer
  const handleDeleteOffer = (id: number) => {
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  // Open create offer modal
  const handleCreateOffer = () => {
    setSelectedOffer({
      id: offers.length + 1,
      title: "",
      description: "",
      rebate: "",
      link: "",
      createdAt: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

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
      <Card>
        <CardHeader>
          <CardTitle>All Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Rebate</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>{offer.title}</TableCell>
                  <TableCell>{offer.description}</TableCell>
                  <TableCell>{offer.rebate}</TableCell>
                  <TableCell>
                    <a href={offer.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Visit
                    </a>
                  </TableCell>
                  <TableCell>{offer.createdAt}</TableCell>
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

      {/* Edit/Create Offer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOffer?.id ? "Edit Offer" : "Create New Offer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Offer Title</Label>
              <Input
                name="title"
                value={selectedOffer?.title || ""}
                onChange={(e) => setSelectedOffer({ ...selectedOffer!, title: e.target.value })}
                placeholder="Enter offer title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={selectedOffer?.description || ""}
                onChange={(e) => setSelectedOffer({ ...selectedOffer!, description: e.target.value })}
                placeholder="Enter offer description"
              />
            </div>
            <div>
              <Label>Rebate %</Label>
              <Input
                name="rebate"
                value={selectedOffer?.rebate || ""}
                onChange={(e) => setSelectedOffer({ ...selectedOffer!, rebate: e.target.value })}
                placeholder="e.g., 20%"
              />
            </div>
            <div>
              <Label>Affiliate Link</Label>
              <Input
                name="link"
                value={selectedOffer?.link || ""}
                onChange={(e) => setSelectedOffer({ ...selectedOffer!, link: e.target.value })}
                placeholder="https://affiliate.example.com"
              />
            </div>
            <Button className="w-full" onClick={handleSaveOffer}>
              {selectedOffer?.id ? "Update Offer" : "Add Offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
