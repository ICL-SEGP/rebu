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


export async function getUserProfile(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  const user = await response.json();

  return toUser(user);
}

export async function updateUserProfile(
  token: string,
  updatedUser: User
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(humps.decamelizeKeys(updatedUser)),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }

  const user = await response.json();

  return toUser(user);
}

export async function archiveUserProfile(token: string) {
  // TODO: add ability to mark as archive then auto delete after 30days

  const response = await fetch(`${API_BASE_URL}/user`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to archive user: ${response.statusText}`);
  }

  const user = await response.json();

  return toUser(user);
}

export async function getUserBalance(token: string): Promise<UserBalance> {
  const response = await fetch(`${API_BASE_URL}/user/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to user balance: ${response.statusText}`);
  }

  //Also call blockchain on elixir side TODO:

  const balance = await response.json();

  return toUserBalance(balance);
}

// Orders

export async function getUserOrders(token: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Orders: ${response.statusText}`);
  }

  const orders = await response.json();

  return orders.map((order: any) => toOrder(order));
}

export async function createUserOrder(
  token: string,
  newOrder: Order
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(humps.decamelizeKeys(newOrder)),
  });

  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

  const order = await response.json();

  return toOrder(order);
}

export async function getUserOrder(
  token: string,
  orderId: number
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Order ${orderId}: ${response.statusText}`);
  }

  const order = await response.json();

  return toOrder(order);
}

export async function updateUserOrder(
  token: string,
  updatedOrder: Order
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${updatedOrder.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(humps.decamelizeKeys(updatedOrder)),
  });

  if (!response.ok) {
    throw new Error(`Failed to update order: ${response.statusText}`);
  }

  const order = await response.json();

  return toOrder(order);
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
