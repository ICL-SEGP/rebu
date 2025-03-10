import { Credentials, toUser, User } from "@/types/types";
import { API_BASE_URL } from "../constants";
import humps from "humps";

export async function logout(token: string) {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to logout: ${response.statusText}`);
  }

  return await response.json();
}

export function registerUser(
  credentials: Credentials,
  referralCode: any
): Promise<User> {
  return fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: humps.decamelizeKeys(credentials),
      referral_code: referralCode,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((errorText) => {
          throw new Error(
            `Failed to create user: ${response.statusText} - ${errorText}`
          );
        });
      }
      return response.json();
    })
    .then((user) => toUser(user));
}

export function registerAffiliate(credentials: Credentials): Promise<User> {
  return fetch(`${API_BASE_URL}/affiliate/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ affiliate: humps.decamelizeKeys(credentials) }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((errorText) => {
          throw new Error(
            `Failed to create affiliate: ${response.statusText} - ${errorText}`
          );
        });
      }
      return response.json();
    })
    .then((user) => toUser(user));
}

export async function changePassword(
  token: string,
  password: string,
  newPassword: string
) {
  const response = await fetch(`${API_BASE_URL}/password-reset`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(humps.decamelizeKeys({ password, newPassword })),
  });

  if (!response.ok) {
    throw new Error(`Failed to update password: ${response.statusText}`);
  }
}
