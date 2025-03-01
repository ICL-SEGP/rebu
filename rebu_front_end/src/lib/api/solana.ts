import { API_BASE_URL } from "../constants";

export async function setPublicKey(
  token: string,
  publicKey: string
) {
  const response = await fetch(`${API_BASE_URL}/solana`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(publicKey),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user's solana public key: ${response.statusText}`);
  }

  return await response.json();
}