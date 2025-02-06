"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, /*DialogTrigger*/ } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil } from "lucide-react";

// Define User type
interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Regular";
  totalOrders: number;
}

// Hardcoded users data
const initialUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", totalOrders: 5 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Regular", totalOrders: 12 },
  { id: 3, name: "Alice Johnson", email: "alice@example.com", role: "Regular", totalOrders: 8 },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "Admin" | "Regular">("All");

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchQuery(searchValue);
    filterUsers(searchValue, roleFilter);
  };

  // Handle role filter
  const handleFilterRole = (role: "All" | "Admin" | "Regular") => {
    setRoleFilter(role);
    filterUsers(searchQuery, role);
  };

  // Filter users based on search and role
  const filterUsers = (search: string, role: "All" | "Admin" | "Regular") => {
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

  // Save edited user
  const handleSaveUser = () => {
    if (selectedUser) {
      setUsers(users.map((user) => (user.id === selectedUser.id ? selectedUser : user)));
      setFilteredUsers(filteredUsers.map((user) => (user.id === selectedUser.id ? selectedUser : user)));
      setIsDialogOpen(false);
    }
  };

  // Delete user
  const handleDeleteUser = (id: number) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
  };

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

        <Select value={roleFilter} onValueChange={(value) => handleFilterRole(value as "All" | "Admin" | "Regular")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
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
                <TableHead>Role</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === user.id ? { ...u, role: value as "Admin" | "Regular" } : u
                          )
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{user.totalOrders}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 size={16} />
                    </Button>
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
              <Select value={selectedUser?.role} onValueChange={(value) => setSelectedUser({ ...selectedUser!, role: value as "Admin" | "Regular" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
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
    </div>
  );
}
