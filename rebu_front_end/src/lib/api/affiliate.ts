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

export function getAffiliateProfile(token: string): Promise<Affiliate> {
  return fetch(`${API_BASE_URL}/affiliate`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch Affiliate: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toAffiliate);
}

export function getReferralCode(token: string) {
  return fetch(`${API_BASE_URL}/affiliate/referral-code`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch referral code: ${response.statusText}`);
      }
      return response.json();
    })
}

export function updateAffiliateProfile(token: string): Promise<Affiliate> {
  return fetch(`${API_BASE_URL}/affiliate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to update Affiliate: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toAffiliate);
}

export function archiveAffiliateProfile(token: string): Promise<Affiliate> {
  return fetch(`${API_BASE_URL}/affiliate`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to archive Affiliate: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toAffiliate);
}

export function getAffiliateBalance(token: string): Promise<AffiliateBalance> {
  return fetch(`${API_BASE_URL}/affiliate/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Affiliate balance: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toAffiliateBalance);
}

export function getAffiliateStats(
  token: string
): Promise<AffiliateMonthlyStat[]> {
  return fetch(`${API_BASE_URL}/affiliate/stats`, {
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
    .then((stats) => stats.map(toAffiliateMonthlyStat));
}
// Offers

export function getAffiliateOffers(token: string): Promise<Offer[]> {
  return fetch(`${API_BASE_URL}/affiliate/offers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Affiliate offers: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((offers) => offers.map((offer: any) => toOffer(offer)));
}

export function createOffer(token: string, newOffer: Offer): Promise<Offer> {
  return fetch(`${API_BASE_URL}/affiliate/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ offer: humps.decamelizeKeys(newOffer) }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to create offer: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toOffer);
}

export function getOffer(token: string, offerId: number): Promise<Offer> {
  return fetch(`${API_BASE_URL}/affiliate/offers/${offerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to get offer ${offerId}: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toOffer);
}

export function updateOffer(
  token: string,
  updatedOffer: Offer
): Promise<Offer> {
  return fetch(`${API_BASE_URL}/affiliate/offers/${updatedOffer.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ offer: humps.decamelizeKeys(updatedOffer) }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to update offer: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toOffer);
}

export function markOfferExpired(
  token: string,
  offerId: number
): Promise<Offer> {
  return fetch(`${API_BASE_URL}/affiliate/offers/${offerId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to mark ${offerId} as expired: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toOffer);
}

// Users

export function affiliateGetUsers(token: string): Promise<User[]> {
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
    .then((users) => users.map((user: any) => toUser(user)));
}

export function affiliateGetUsersIdx(token: string): Promise<any> {
  return fetch(`${API_BASE_URL}/affiliate/users/idx`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(
        `Failed to fetch all Affiliate's user idxs: ${response.statusText}`
      );
    }

    return response.json();
  });
}

export function affiliateCreateUser(
  token: string,
  newUser: any
): Promise<User> {
  return fetch(`${API_BASE_URL}/affiliate/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: humps.decamelizeKeys(newUser) }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toUser);
}

export function affiliateGetUserById(
  token: string,
  userId: number
): Promise<User> {
  return fetch(`${API_BASE_URL}/affiliate/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to get user ${userId}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toUser);
}

export function affiliateUpdateUserDetails(
  token: string,
  updatedUser: User
): Promise<User> {
  return fetch(`${API_BASE_URL}/affiliate/users/${updatedUser.id}`, {
    method: "PATCH",
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

export function affiliateArchiveUser(
  token: string,
  userId: number
): Promise<User> {
  return fetch(`${API_BASE_URL}/affiliate/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to archive user ${userId}: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toUser);
}

// Orders

export function getAllLinkedOrders(token: string): Promise<Order[]> {
  return fetch(`${API_BASE_URL}/affiliate/orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch linked Orders: ${response.statusText}`
        );
      }

      return response.json();
    })
    .then((orders) => orders.map((order: any) => toOrder(order)));
}

export function affiliateCreateOrder(
  token: string,
  userId: string,
  newOrder: any
): Promise<Order> {
  return fetch(`${API_BASE_URL}/affiliate/orders/user/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order: humps.decamelizeKeys(newOrder) }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }
      return response.json();
    })
    .then(toOrder);
}

export function affiliateGetOrder(
  token: string,
  orderId: number
): Promise<Order> {
  return fetch(`${API_BASE_URL}/affiliate/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to get order ${orderId}: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toOrder);
}

export function affiliateUpdateOrder(
  token: string,
  updatedOrder: any
): Promise<Order> {
  return fetch(`${API_BASE_URL}/affiliate/orders/${updatedOrder.id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order: humps.decamelizeKeys(updatedOrder) }),
  })
    .then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error(
          `Failed to update order ${updatedOrder.id}: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toOrder);
}

export function affiliateGetOrdersForUser(
  token: string,
  userId: number
): Promise<Order[]> {
  return fetch(`${API_BASE_URL}/affiliate/orders/user/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to get orders for user ${userId}: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((orders) => orders.map(toOrder));
}

export function affiliateCancelOrder(
  token: string,
  orderId: number
): Promise<Order> {
  return fetch(`${API_BASE_URL}/affiliate/orders/${orderId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to cancel order ${orderId}: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then(toOrder);
}
