import { API_BASE_URL } from "@/lib/constants";
import {
  Affiliate,
  AffiliateBalance,
  AffiliateMonthlyStat,
  Offer,
  Order,
  toAffiliate,
  toAffiliateBalance,
  toAffiliateMonthlyStat,
  toOffer,
  toOrder,
  toUser,
  User,
} from "@/types/app";
import humps from "humps";

// Profile

export async function getAffiliateProfile(token: string): Promise<Affiliate> {
  const response = await fetch(`${API_BASE_URL}/affiliate`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Affiliate: ${response.statusText}`);
  }

  const Affiliate = await response.json();

  return toAffiliate(Affiliate);
}

export async function updateAffiliateProfile(
  token: string
): Promise<Affiliate> {
  const response = await fetch(`${API_BASE_URL}/affiliate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to update Affiliate: ${response.statusText}`);
  }

  const Affiliate = await response.json();

  return toAffiliate(Affiliate);
}

export async function archiveAffiliateProfile(token: string) {
  // TODO: add ability to mark as archive then auto delete after 30days

  const response = await fetch(`${API_BASE_URL}/affiliate`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to archive Affiliate: ${response.statusText}`);
  }

  const affiliate = await response.json();

  return toAffiliate(affiliate);
}

export async function getAffiliateBalance(
  token: string
): Promise<AffiliateBalance> {
  const response = await fetch(`${API_BASE_URL}/affiliate/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Affiliate balance: ${response.statusText}`
    );
  }

  //Also call blockchain on elixir side TODO:

  const balance = await response.json();

  return toAffiliateBalance(balance);
}

export async function getAffiliateStats(
  token: string
): Promise<AffiliateMonthlyStat[]> {
  const response = await fetch(`${API_BASE_URL}/affiliate/stats`, {
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

  return stats.map((stat: any) => toAffiliateMonthlyStat(stat));
}

// Offers

export async function getAffiliateOffers(token: string): Promise<Offer[]> {
  const response = await fetch(`${API_BASE_URL}/affiliate/offers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Affiliate offers: ${response.statusText}`);
  }

  const offers = await response.json();

  return offers.map((offer: any) => toOffer(offer));
}

export async function createOffer(
  token: string,
  newOffer: Offer
): Promise<Offer> {
  const response = await fetch(`${API_BASE_URL}/affiliate/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(humps.decamelizeKeys(newOffer)),
  });

  if (!response.ok) {
    throw new Error(`Failed to create offer: ${response.statusText}`);
  }

  const offer = await response.json();

  return toOffer(offer);
}

export async function getOffer(token: string, offerId: number): Promise<Offer> {
  const response = await fetch(`${API_BASE_URL}/affiliate/offers/${offerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get offer ${offerId}: ${response.statusText}`);
  }

  const offer = await response.json();

  return toOffer(offer);
}

export async function updateOffer(
  token: string,
  updatedOffer: Offer
): Promise<Offer> {
  const response = await fetch(
    `${API_BASE_URL}/affiliate/offers/${updatedOffer.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(humps.decamelizeKeys(updatedOffer)),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update offer: ${response.statusText}`);
  }

  const offer = await response.json();

  return toOffer(offer);
}

export async function markOfferExpired(
  token: string,
  offerId: number
): Promise<Offer> {
  const response = await fetch(`${API_BASE_URL}/affiliate/offers/${offerId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to mark ${offerId} as expired: ${response.statusText}`
    );
  }

  const offer = await response.json();

  return toOffer(offer);
}

// Users

export async function affiliateGetUsers(token: string): Promise<User[]> {
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

export async function affiliateCreateUser(
  token: string,
  newUser: any
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/affiliate/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(humps.decamelizeKeys(newUser)),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }

  const user = await response.json();

  return toUser(user);
}

export async function affiliateGetUserById(
  token: string,
  userId: number
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/affiliate/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user ${userId}: ${response.statusText}`);
  }

  const user = await response.json();

  return toUser(user);
}

export async function affiliateUpdateUserDetails(
  token: string,
  updatedUser: User
): Promise<User> {
  const response = await fetch(
    `${API_BASE_URL}/affiliate/users/${updatedUser.id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(humps.decamelizeKeys(updatedUser)),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }

  const user = await response.json();

  return toUser(user);
}

export async function affiliateArchiveUser(
  token: string,
  userId: number
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/affiliate/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to archive user ${userId}: ${response.statusText}`);
  }

  const user = await response.json();

  return toUser(user);
}

// Orders

export async function getAllLinkedOrders(token: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/affiliate/orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch linked Orders: ${response.statusText}`);
  }

  const orders = await response.json();

  return orders.map((order: any) => toOrder(order));
}

export async function affiliateCreateOrder(
  token: string,
  userId: number,
  newOrder: Order
): Promise<Order> {
  const response = await fetch(
    `${API_BASE_URL}/affiliate/orders/user/${userId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(humps.decamelizeKeys(newOrder)),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

  const order = await response.json();

  return toOrder(order);
}

export async function affiliateGetOrder(
  token: string,
  orderId: Order
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/affiliate/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get order ${orderId}: ${response.statusText}`);
  }

  const order = await response.json();

  return toOrder(order);
}

export async function affiliateUpdateOrder(
  token: string,
  updatedOrder: Order
): Promise<Order> {
  const response = await fetch(
    `${API_BASE_URL}/affiliate/orders/${updatedOrder.id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(humps.decamelizeKeys(updatedOrder)),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to update order ${updatedOrder.id}: ${response.statusText}`
    );
  }

  const order = await response.json();

  return toOrder(order);
}

export async function affiliateGetOrdersForUser(
  token: string,
  userId: number
): Promise<Order[]> {
  const response = await fetch(
    `${API_BASE_URL}/affiliate/orders/user/${userId}`,
    {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get orders for user ${userId}: ${response.statusText}`
    );
  }

  const orders = await response.json();

  return orders.map((order: any) => toOrder(order));
}

export async function affiliateCancelOrder(
  token: string,
  orderId: number
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/affiliate/orders/${orderId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to cancel order ${orderId}: ${response.statusText}`
    );
  }

  const order = await response.json();

  return toOrder(order);
}
