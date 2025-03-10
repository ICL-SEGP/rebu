"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Pencil,
  PlusCircle,
  Cross,
  CrossIcon,
  X,
  UserX,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";
import {
  affiliateBlockUser,
  affiliateCreateUser,
  affiliateGetUsers,
  affiliateUpdateUserDetails,
} from "@/lib/api/affiliate";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/types";

enum SortOption {
  LATEST_JOINED = "latest_joined",
  TOKEN_BALANCE = "token_balance",
  TOTAL_ORDERS = "total_orders",
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>(
    SortOption.LATEST_JOINED
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [selectedStatsUser, setSelectedStatsUser] = useState<User | null>(null);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [blockUser, setBlockUser] = useState<User | null>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  const { data: session } = useSession();

  const {
    data: usersList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => affiliateGetUsers(session!.accessToken),
  });

  useEffect(() => {
    if (usersList) {
      setUsers(usersList);
      setFilteredUsers(usersList);
      sortUsers(usersList, sortOption);
    }
  }, [usersList, sortOption]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchQuery(searchValue);
    filterUsers(searchValue);
  };

  const filterUsers = (search: string) => {
    let filtered = [...users];

    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const updateUser = async (selectedUser: User) => {
    if (!selectedUser) return;

    if (
      !window.confirm(
        `Are you sure you want to update User #${selectedUser.id}?`
      )
    ) {
      return;
    }

    try {
      const updatedUser = await affiliateUpdateUserDetails(
        session!.accessToken,
        selectedUser
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? selectedUser : user
        )
      );
      setFilteredUsers((prevFilteredUsers) =>
        prevFilteredUsers.map((user) =>
          user.id === selectedUser.id ? selectedUser : user
        )
      );
      setIsDialogOpen(false);
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update user.");
    }
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      updateUser(selectedUser);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const res = await fetch(
        `<span class="math-inline">\{API\_BASE\_URL\}/api/affiliate/users/</span>{id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session!.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      toast.success("User deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete user");
    }
  };

  const handleInputChange = (email: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [email]: value,
    }));
  };

  const handleUserStats = (user: User) => {
    setSelectedStatsUser(user);
    setIsStatsDialogOpen(true);
  };

  const sortUsers = (userList: User[], sortOption: SortOption) => {
    let sortedUsers = [...userList];

    switch (sortOption) {
      case SortOption.LATEST_JOINED:
        sortedUsers.sort(
          (a, b) =>
            new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime()
        );
        break;
      case SortOption.TOKEN_BALANCE:
        sortedUsers.sort((a, b) => b.tokenBalance - a.tokenBalance);
        break;
      case SortOption.TOTAL_ORDERS:
        sortedUsers.sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0));
        break;
      default:
        break;
    }

    setFilteredUsers(sortedUsers);
  };

  const handleCreateUser = () => {
    setIsCreateDialogOpen(true);
    setNewUser({});
  };

  const saveNewUser = async () => {
    if (!newUser) return;

    if (
      !window.confirm(`Are you sure you want to create #${newUser?.firstName}?`)
    ) {
      return;
    }

    try {
      const createdUser = await affiliateCreateUser(
        session!.accessToken,
        newUser
      );

      setUsers((prevUsers) => [...prevUsers, createdUser]);
      setFilteredUsers((prevFilteredUsers) => [
        ...prevFilteredUsers,
        createdUser,
      ]);

      setIsCreateDialogOpen(false);
      toast.success("User created successfully!");
    } catch (error: any) {
      toast.error("Failed to create user email taken.");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const handleBlockUser = (user: User) => {
    setBlockUser(user);
    setIsBlockDialogOpen(true);
  };

  const confirmBlockUser = async () => {
    if (!blockUser) return;

    try {
      // Implement your block user API call here
      // Example: await blockUserApi(blockUser.id, session!.accessToken);
      console.log(`Blocking user: ${blockUser.id}`);

      // Simulate API call and update UI
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== blockUser.id)
      );
      setFilteredUsers((prevFilteredUsers) =>
        prevFilteredUsers.filter((user) => user.id !== blockUser.id)
      );

      await affiliateBlockUser(session?.accessToken, session?.user.id)

      setIsBlockDialogOpen(false);
      toast.success(`${blockUser.firstName} blocked successfully!`);
    } catch (error: any) {
      toast.error("Failed to block user.");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      <div className="flex gap-4">
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/3"
        />

        <div className="flex gap-2">
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SortOption.LATEST_JOINED}>
                Latest Joined
              </SelectItem>
              <SelectItem value={SortOption.TOKEN_BALANCE}>
                Token Balance
              </SelectItem>
              <SelectItem value={SortOption.TOTAL_ORDERS}>
                Total Orders
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => handleCreateUser()}
          >
            <PlusCircle size={18} /> Create User
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">First Name</Label>
              <Input
                id="firstName"
                placeholder="Gabriel"
                value={newUser.firstName || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Costa"
                value={newUser.lastName || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="john.smith@gmail.com"
                value={newUser.email || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="********"
                type="password"
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
            </div>

            <Button className="w-full" onClick={saveNewUser}>
              Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleUserStats(user)}
                >
                  <TableCell>{user.firstName + " " + user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.tokenBalance}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditUser(user);
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockUser(user);
                      }}
                    >
                      <UserX size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>First Name</Label>
              <Input
                name="first-name"
                value={selectedUser?.firstName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser!,
                    firstName: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                name="last-name"
                value={selectedUser?.lastName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser!,
                    lastName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                value={selectedUser?.email || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser!, email: e.target.value })
                }
              />
            </div>
            <Button className="w-full" onClick={handleSaveUser}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedStatsUser?.firstName + " " + selectedStatsUser?.lastName}{" "}
              Stats
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={selectedStatsUser?.email || ""} disabled />
            </div>
            <div>
              <Label>Token Balance</Label>
              <Input value={selectedStatsUser?.tokenBalance || 0} disabled />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={selectedStatsUser?.role || ""} disabled />
            </div>
            {/* Add more stats here */}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Confirm User Block
            </DialogTitle>
          </DialogHeader>
          <div className="mb-6">
            <p className="text-base text-gray-600">
              Are you sure you want to block{" "}
              <strong className="text-red-600 font-medium">
                {blockUser?.firstName}
              </strong>{" "}
              from your user network?
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-red-500 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2 0 4.623-2.599 4.623H4.645c-2.6 0-3.754-2.623-2.599-4.623L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 11-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-700 font-semibold text-sm uppercase tracking-wide">
                Warning: Irreversible Action
              </span>
            </div>
            <p className="text-sm text-gray-600">
              <strong className="font-semibold">
                The user will be notified via email.
              </strong>
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsBlockDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBlockUser}>
              Confirm Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
