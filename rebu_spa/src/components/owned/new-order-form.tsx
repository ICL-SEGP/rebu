import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { API_BASE_URL } from "@/lib/constants";
import { Check, PlusCircle } from "lucide-react";
import { Offer, Order, OrderStatus } from "@/types/types";
import {
  affiliateCreateOrder,
  affiliateGetUsersIdx,
} from "@/lib/api/affiliate";
import { useQuery } from "@tanstack/react-query";
import { StackId } from "recharts/types/util/ChartUtils";
import toast from "react-hot-toast";
import { DateTimePicker } from "@/components/owned/datetime-picker";

export default function NewOrderForm({
  setOrders,
  offers,
}: {
  setOrders: any;
  offers: Offer[];
}) {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<{
    email: string;
    id: string;
  }>();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<any>({
    totalRebateAmount: "",
    status: OrderStatus.COMPLETED,
    orderDate: new Date(),
  });

  const { data: userList } = useQuery({
    queryKey: ["affiliate-offers-idx"],
    queryFn: () => affiliateGetUsersIdx(session!.accessToken),
  });

  useEffect(() => {
    if (userList) {
      setUsers(userList);
    }
  }, [userList]);

  const filteredUsers = search
    ? users.filter((user: { email: string; id: string }) =>
        user.email.toLowerCase().includes(search.toLowerCase())
      )
    : users.slice(0, 5); // Show first 5 users initially

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle field changes
  const handleChange = (field: string, value: string | Date) => {
    setNewOrder((prev: any) => ({ ...prev, [field]: value }));
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
      const createdOrder = await affiliateCreateOrder(
        session!.accessToken,
        selectedUser?.id,
        newOrder
      );

      console.log("created", createdOrder);

      toast.success("Order created successfully!");

      // Update orders list
      setOrders((prevOrders) => [createdOrder, ...prevOrders]);

      // Reset form & close modal
      setNewOrder({
        totalRebateAmount: "",
        status: OrderStatus.COMPLETED,
        orderDate: new Date(),
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        document.activeElement?.blur();
        setShowSuggestions(false);
      }, 10);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-6 w-full">
          <PlusCircle size={18} /> New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-6 ">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div ref={dropdownRef}>
            <Input
              type="text"
              placeholder="Search user by email..."
              value={search}
              onFocus={() => setShowSuggestions(true)} // Show on focus
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true); // Keep showing suggestions while typing
              }}
              autoFocus={false}
              className="w-full p-2 border rounded-md"
            />

            {showSuggestions && (
              <div className="absolute w-full bg-white border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto z-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedUser(user);
                        setSearch(user.email); // Set selected email in input
                        setShowSuggestions(false);
                      }}
                    >
                      {user.email}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <Select
            value={newOrder.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent defaultValue={OrderStatus.COMPLETED}>
              <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={OrderStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={OrderStatus.CANCELED}>Refunded</SelectItem>
            </SelectContent>
          </Select>

          {/* Multi-Select Offers Dropdown */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Select Offers:</label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {newOrder.offers && newOrder.offers.length > 0
                    ? `${newOrder.offers.length} offer(s) selected`
                    : "Select Offers"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-auto p-2 bg-white border rounded-lg shadow-lg"
              >
                <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto p-2">
                  {Array.isArray(offers) && offers.length > 0 ? (
                    offers.map((offer) => {
                      const isSelected =
                        Array.isArray(newOrder.offers) &&
                        newOrder.offers.includes(offer.id);

                      return (
                        <div
                          key={offer.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                          onClick={() => {
                            setNewOrder((prev) => ({
                              ...prev,
                              offers: isSelected
                                ? prev.offers?.filter(
                                    (id) => id !== offer.id
                                  ) ?? []
                                : [...(prev.offers ?? []), offer.id],
                            }));
                            setError(""); // Clear error on offer select
                          }}
                        >
                          {/* Checkbox UI */}
                          <div
                            className={`w-5 h-5 border rounded-md flex items-center justify-center transition ${
                              isSelected
                                ? "bg-green-500 text-white"
                                : "bg-white"
                            }`}
                          >
                            {isSelected && <Check size={16} />}
                          </div>

                          {/* Offer Title */}
                          <span className="text-sm">
                            Offer ID: {offer.id} {offer.desc}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-center">
                      No offers available
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Calendar for Date Selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Select Order Date:</label>
            <DateTimePicker
              value={newOrder.date}
              onChange={(date) => {
                handleChange("date", date || new Date());
                document.activeElement?.blur(); // Close popover when date is selected
              }}
              hideTime={true}
            />
            {/* <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {newOrder.date
                    ? format(newOrder.date, "dd MMM yyyy")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>

              {/* Fixes alignment + auto-close when date is selected
              <PopoverContent
                align="center"
                side="bottom"
                className="w-auto p-2 bg-white border rounded-lg shadow-lg"
              >
                <Calendar
                  mode="single"
                  selected={newOrder.date}
                  onSelect={(date) => {
                    handleChange("date", date || new Date());
                    document.activeElement?.blur(); // Close popover when date is selected
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover> */}
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
