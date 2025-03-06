import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/modals/dialog";
import { Button } from "@/components/ui/helpers/button";
import { Input } from "@/components/ui/forms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Calendar } from "@/components/ui/helpers/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { API_BASE_URL } from "@/lib/constants";
import { Check } from "lucide-react";

export default function NewOrderForm({ setOrders }) {
  const [offers, setOffers] = useState([]);
  const { data: session } = useSession();
  if (!session) throw new Error("No user logged in.");

  const [open, setOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    user: "",
    offer: "",
    amount: "",
    status: "in_progress",
    date: new Date(),
    offers: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle field changes
  const handleChange = (field: keyof typeof newOrder, value: string | Date) => {
    setNewOrder((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error on change
  };

  // Submit new order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOrder.offers || newOrder.offers.length === 0) {
      setError("Please select at least one offer.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/affiliate/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          ...newOrder,
          date: format(newOrder.date, "yyyy-MM-dd"), // Convert date to string format
        }),
      });

      console.log(response);

      if (!response.ok) throw new Error("Failed to create order.");

      const order = await response.json();

      const createdOrder = {
        id: order.id,
        offers: order.offers.map((offer) => offer.id),
        user: order.user?.email,
        date: order.date,
        status: order.status, // Renaming inserted_at to date
        amount: parseFloat(order.total_rebate_amount).toFixed(2), // Convert to number
      };

      console.log("created", createdOrder);

      // Update orders list
      setOrders((prevOrders) => [createdOrder, ...prevOrders]);

      // Reset form & close modal
      setNewOrder({ user: "", offer: "", amount: "", status: "in_progress", date: new Date(), offers: [] });
      setOpen(false);
      alert("Order created successfully!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  // const fetchOffers = async () => {
  //   try {
  //     const res = await fetch(`${API_BASE_URL}/api/offers`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${session.accessToken}`,
  //       },
  //     });

  //     if (!res.ok) throw new Error("Failed to fetch balance");

  //     const offers = (await res.json()).data;

  //     let fetchedOffers = await offers.map((offer) => ({
  //       id: offer.id,
  //       desc: offer.desc,
  //       affiliate_link: offer.affiliate_link,
  //       offer_started: offer.offer_start,
  //       offer_end: offer.offer_end,
  //       rebate_percentage: parseFloat(offer.rebate_percentage).toFixed(2),
  //     }));

  //     setOffers(fetchedOffers);
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchOffers();
  // }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-6 w-full">+ New Order</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="User Email"
            value={newOrder.user}
            onChange={(e) => handleChange("user", e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Total Rebate Amount"
            value={newOrder.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            required
          />

          {/* Status Dropdown */}
          <Select value={newOrder.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_progress">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          {/* Multi-Select Offers Dropdown */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Select Offers:</label>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {newOrder.offers && newOrder.offers.length > 0
                    ? `${newOrder.offers.length} offer(s) selected`
                    : "Select Offers"}
                </Button>
              </PopoverTrigger>

              <PopoverContent align="start" className="w-auto p-2 bg-white border rounded-lg shadow-lg">
                <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto p-2">
                  {offers.map((offer) => {
                    const isSelected = Array.isArray(newOrder.offers) && newOrder.offers.includes(offer.id);

                    return (
                      <div
                        key={offer.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => {
                          setNewOrder((prev) => ({
                            ...prev,
                            offers: isSelected
                              ? prev.offers.filter((id) => id !== offer.id)
                              : [...prev.offers, offer.id],
                          }));
                          setError(""); //clear error on offer select
                        }}
                      >
                        {/* Checkbox UI */}
                        <div
                          className={`w-5 h-5 border rounded-md flex items-center justify-center transition ${isSelected ? "bg-green-500 text-white" : "bg-white"}`}
                        >
                          {isSelected && <Check size={16} />}
                        </div>

                        {/* Offer Title */}
                        <span className="text-sm">Offer ID:{offer.id} {offer.desc} </span>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Calendar for Date Selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Select Order Date:</label>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {newOrder.date ? format(newOrder.date, "dd MMM yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>

              {/* Fixes alignment + auto-close when date is selected */}
              <PopoverContent align="center" side="bottom" className="w-auto p-2 bg-white border rounded-lg shadow-lg">
                <Calendar
                  mode="single"
                  selected={newOrder.date}
                  onSelect={(date) => {
                    handleChange("date", date || new Date());
                    document.activeElement?.blur(); // Close popover when date is selected
                  }}
                  className="rounded-md shadow-md w-full"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}