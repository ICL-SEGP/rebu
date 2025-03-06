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

export function getAdminBalance(token: string): Promise<AdminBalance> {
  return fetch(`${API_BASE_URL}/admin/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Admin balance: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toAdminBalance);
}

export function getAdminDashboardStats(
  token: string
): Promise<AdminMonthlyStat[]> {
  return fetch(`${API_BASE_URL}/api/admin/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      return response.json();
    })
    .then((stats) => stats.map(toAdminMonthlyStat));
}

export function adminGetSingleAffiliateDetails(
  token: string,
  id: number
): Promise<Affiliate> {
  return fetch(`${API_BASE_URL}/api/admin/affiliates/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch affiliate ${id}: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toAffiliate);
}

export function getAllAffiliates(token: string): Promise<Affiliate[]> {
  return fetch(`${API_BASE_URL}/api/admin/affiliates`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch all admin's users: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((affiliates) => affiliates.map(toAffiliate));
}

export function updateAffiliateDetails(
  token: string,
  updatedAffiliate: Affiliate
): Promise<Affiliate> {
  return fetch(`${API_BASE_URL}/api/admin/affiliates/${updatedAffiliate.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(humps.decamelizeKeys(updatedAffiliate)),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to update affiliates: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toAffiliate);
}

export function getAllOffers(token: string): Promise<Offer[]> {
  return fetch(`${API_BASE_URL}/offers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch all offers: ${response.statusText}`);
      }
      return response.json();
    })
    .then((offers) => offers.map(toOffer));
}

export function getAllUsers(token: string): Promise<User[]> {
  return fetch(`${API_BASE_URL}/affiliate/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch all Affiliate's users: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((users) => users.map(toUser));
}
