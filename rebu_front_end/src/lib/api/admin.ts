import { API_BASE_URL } from "@/lib/constants";
import {
  AdminBalance,
  AdminMonthlyStat,
  Affiliate,
  Offer,
  toAdminBalance,
  toAdminMonthlyStat,
  toAffiliate,
  toOffer,
  toUser,
  User,
} from "@/types/app";
import humps from "humps";

export async function getAdminBalance(
  token: string
): Promise<AdminBalance> {
  const response = await fetch(`${API_BASE_URL}/admin/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Admin balance: ${response.statusText}`
    );
  }

  //Also call blockchain on elixir side TODO:

  const balance = await response.json();

  return toAdminBalance(balance);
}

export async function getAdminDashboardStats(
  token: string
): Promise<AdminMonthlyStat[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  const stats = await response.json();

  return stats.map((stat: any) => toAdminMonthlyStat(stat));
}

export async function adminGetSingleAffiliateDetails(
  token: string,
  id: number
): Promise<Affiliate> {
  const response = await fetch(`${API_BASE_URL}/api/admin/affiliates/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch affiliate ${id}: ${response.statusText}`);
  }

  const affiliate = await response.json();

  return toAffiliate(affiliate);
}

export async function GetAllAffiliates(
  token: string,
  id: number
): Promise<Affiliate[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/affiliates`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch all admin's users: ${response.statusText}`
    );
  }

  const affiliates = await response.json();

  return affiliates.map((affiliate: any) => toAffiliate(affiliate));
}

export async function createAffiliate(
  token: string,
  newAffiliate: any
): Promise<Affiliate> {
  const response = await fetch(`${API_BASE_URL}/api/admin/affiliates/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(humps.decamelizeKeys(newAffiliate)),
  });

  if (!response.ok) {
    throw new Error(`Failed to update affiliates: ${response.statusText}`);
  }

  const affiliate = await response.json();

  return toAffiliate(affiliate);
}

export async function updateAffiliateDetails(
  token: string,
  updatedAffiliate: Affiliate
): Promise<Affiliate> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/affiliates/${updatedAffiliate.id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(humps.decamelizeKeys(updatedAffiliate)),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update affiliates: ${response.statusText}`);
  }

  const user = await response.json();

  return toAffiliate(user);
}

export async function getAllOffers(token: string): Promise<Offer[]> {
  const response = await fetch(`${API_BASE_URL}/offers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch all offers: ${response.statusText}`);
  }

  const offers = await response.json();

  return offers.map((offer: any) => toOffer(offer));
}

export async function GetAllUsers(token: string, id: number): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/affiliate/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch all Affiliate's users: ${response.statusText}`
    );
  }

  const users = await response.json();

  return users.map((user: any) => toUser(user));
}