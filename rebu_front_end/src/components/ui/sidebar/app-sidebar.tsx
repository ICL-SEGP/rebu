"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/sidebar/helpers/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/helpers/button";

const navItems = [
  { title: "Dashboard", url: "/affiliate/dashboard" },
  { title: "Users", url: "/affiliate/users" },
  { title: "Offers", url: "/affiliate/offers" },
  { title: "Orders", url: "/affiliate/orders" },
  { title: "Marketplace", url: "/affiliate/marketplace"}
];

export function AppSidebarAffiliate({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Sidebar {...props}>
      {/* User Button at the Top */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between">
              {session?.user?.email || "Affiliate"} <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/affiliate/profile")}>
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()} className="text-red-500">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation Links */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>{item.title}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
