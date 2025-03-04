import { Credentials, toUser, User } from "@/types/app";
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

export async function registerUser(credentials: Credentials): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({user: humps.decamelizeKeys(credentials)}),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }

  const user = await response.json();

  return toUser(user);
}

export async function registerAffiliate(
  credentials: Credentials
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/affiliate/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(humps.decamelizeKeys(credentials)),
  });

  if (!response.ok) {
    throw new Error(`Failed to create affiliate: ${response.statusText}`);
  }

  const user = await response.json();

  return toUser(user);
}
