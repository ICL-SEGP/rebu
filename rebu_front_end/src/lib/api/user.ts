import { API_BASE_URL } from "@/lib/constants";
import {
  Offer,
  Order,
  toOffer,
  toOrder,
  toUser,
  toUserBalance,
  User,
  UserBalance,
} from "@/types/app";
import humps from "humps";

export function getUserProfile(token: string): Promise<User> {
  return fetch(`${API_BASE_URL}/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toUser);
}

export function updateUserProfile(
  token: string,
  updatedUser: User
): Promise<User> {
  return fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: humps.decamelizeKeys(updatedUser) }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toUser);
}

export function archiveUserProfile(token: string): Promise<User> {
  return fetch(`${API_BASE_URL}/user`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to archive user: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toUser);
}

export function getUserBalance(token: string): Promise<UserBalance> {
  return fetch(`${API_BASE_URL}/user/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch user balance: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toUserBalance);
}

// Orders

export async function getUserOrders(token: string): Promise<Order[]> {
  return fetch(`${API_BASE_URL}/orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch Orders: ${response.statusText}`);
      }
      return response.json();
    })
    .then((orders) => orders.map((order: any) => toOrder(order)));
}

export function createUserOrder(
  token: string,
  newOrder: Order
): Promise<Order> {
  return fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(humps.decamelizeKeys(newOrder)),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toOrder);
}

export function getUserOrder(token: string, orderId: number): Promise<Order> {
  return fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Order ${orderId}: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toOrder);
}

export function updateUserOrder(
  token: string,
  updatedOrder: Order
): Promise<Order> {
  return fetch(`${API_BASE_URL}/orders/${updatedOrder.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(humps.decamelizeKeys(updatedOrder)),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toOrder);
}

// Offers
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
        throw new Error(`Failed to fetch offers: ${response.statusText}`);
      }
      return response.json();
    })
    .then((offers) => offers.map((offer: any) => toOffer(offer)));
}
