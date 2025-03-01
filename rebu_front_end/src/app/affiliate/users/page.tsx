"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/helpers/card";
import { Button } from "@/components/ui/helpers/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/tables/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, /*DialogTrigger*/ } from "@/components/ui/modals/dialog";
import { Label } from "@/components/ui/forms/label";
import { Input } from "@/components/ui/forms/input";
import { Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/notifications/toaster"
import { API_BASE_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";


// Define User type
interface User {
  id: number;
  name: string;
  email: string;
  role: "Affiliate" | "Regular";
  totalOrders: number;
}

// Hardcoded users data
const initialUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Affiliate", totalOrders: 5 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Regular", totalOrders: 12 },
  { id: 3, name: "Alice Johnson", email: "alice@example.com", role: "Regular", totalOrders: 8 },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "Affiliate" | "Regular">("All");
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const { toast, dismiss } = useToast();
  const { data: session } = useSession();



  const fetchUsers = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/affiliate/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const users = (await res.json()).users;
      console.log(users)

      // let fetchedOrders: Order[] = await orders.map((order) => ({
      //   id: order.id,
      //   status: order.status,
      //   date: order.inserted_at, // Renaming inserted_at to date
      //   totalRebateAmount: parseFloat(order.total_rebate_amount).toFixed(2), // Convert to number
      // }))

      setUsers(users);
      setFilteredUsers(users);


    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [])

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchQuery(searchValue);
    filterUsers(searchValue, roleFilter);
  };

  // Handle role filter
  const handleFilterRole = (role: "All" | "Affiliate" | "Regular") => {
    setRoleFilter(role);
    filterUsers(searchQuery, role);
  };

  // Filter users based on search and role
  const filterUsers = (search: string, role: "All" | "Affiliate" | "Regular") => {
    let filtered = [...initialUsers];

    if (role !== "All") {
      filtered = filtered.filter((user) => user.role === role);
    }

    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  // Open edit modal
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const updateUser = async (selectedUser) => {
    setUsers(users.map((user) => (user.id === selectedUser.id ? selectedUser : user)));
    setFilteredUsers(filteredUsers.map((user) => (user.id === selectedUser.id ? selectedUser : user)));
    setIsDialogOpen(false);


    const res = await fetch(`${API_BASE_URL}/api/affiliate/users/${selectedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch users");
  }
  // Save edited user
  const handleSaveUser = () => {
    if (selectedUser) {
      updateUser(selectedUser);
    }};

    // Delete user
    const handleDeleteUser = (id: number) => {
      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    };

    const handleInputChange = (email: string, value: string) => {
      setInputValues((prev) => ({
        ...prev,
        [email]: value,
      }));
    };

    const handleTokenGive = (user: string) => {
      const inputValue = inputValues[user] || "";
      let numericValue = Number(inputValue);
      if (isNaN(numericValue)) {
        numericValue = 0
      }
      toast({ title: "Tokens Given!", description: numericValue + " tokens given." })
      console.log(inputValue)
    }

    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-1/3"
          />

          <Select value={roleFilter} onValueChange={(value) => handleFilterRole(value as "All" | "Affiliate" | "Regular")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Affiliate">Affiliate</SelectItem>
              <SelectItem value="Regular">Regular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Escrow</TableHead>
                  <TableHead>Rescinded</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.token_balance}</TableCell>
                    <TableCell>{user.locked_tokens}</TableCell>
                    <TableCell>{user.rescinded_tokens}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          setUsers((prev) =>
                            prev.map((u) =>
                              u.id === user.id ? { ...u, role: value as "affiliate" | "user" } : u
                            )
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Affiliate">Affiliate</SelectItem>
                          <SelectItem value="Regular">Regular</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button onClick={() => handleTokenGive(user.email)}>
                          Submit
                        </Button>
                        {/* <Toaster /> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input name="name" value={selectedUser?.name || ""} onChange={(e) => setSelectedUser({ ...selectedUser!, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" value={selectedUser?.email || ""} onChange={(e) => setSelectedUser({ ...selectedUser!, email: e.target.value })} />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={selectedUser?.role} onValueChange={(value) => setSelectedUser({ ...selectedUser!, role: value as "Affiliate" | "Regular" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Affiliate">Affiliate</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleSaveUser}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Toaster />
      </div>
    );
  }
