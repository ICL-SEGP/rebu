import humps from "humps";
import { API_BASE_URL, BLOCKCHAIN_OFFSET } from "../constants";

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import RebuSolanaIDLJson from "@/../target/idl/solanaIDL.json";
import type { RebuSolana } from "@/types/solanaIDL";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorProvider } from "@/components/solana/solana-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export { RebuSolana, RebuSolanaIDLJson };

export const REBU_SOLANA_PROGRAM_ID = new PublicKey(RebuSolanaIDLJson.address);

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const TOKEN_2022_PROGRAM_ID: PublicKey = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

const MINT = new PublicKey("2Tkswza6ftvMCU3FdmQLHqFcyJzqMNi41YX69eAfTdLt");

const DEVNET = {
  name: "devnet",
  endpoint: "https://api.devnet.solana.com",
};

export function getSolanaProgram(
  provider: anchor.AnchorProvider,
  address?: PublicKey
) {
  return new anchor.Program(
    {
      ...RebuSolanaIDLJson,
      address: address ? address.toBase58() : RebuSolanaIDLJson.address,
    } as RebuSolana,
    provider
  );
}

// This is a helper function to get the program ID for the TestAppSolana program depending on the cluster.
export function getSolanaProgramId() {
  return REBU_SOLANA_PROGRAM_ID;
}

export function useMakePurchase() {
  const provider = useAnchorProvider();
  const { publicKey, signTransaction } = useWallet();
  const programId = getSolanaProgramId();
  const program = getSolanaProgram(provider, programId);

  const mutation = useMutation({
    mutationKey: ["rebuSolana", "makePurchase", { DEVNET }],
    mutationFn: async ({
      seller_str,
      productId,
    }: {
      seller_str: string;
      productId: number;
    }) => {
      if (!publicKey || !signTransaction) {
        toast.error("Please connect your wallet.");
        throw new Error("Wallet not connected.");
      }

      productId = productId + BLOCKCHAIN_OFFSET;

      const seller = new PublicKey(seller_str);
      const intBuffer = new anchor.BN(productId);

      const customerAta = await getAssociatedTokenAddress(
        MINT,
        publicKey,
        true,
        TOKEN_2022_PROGRAM_ID,
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      );
      const sellerAta = await getAssociatedTokenAddress(
        MINT,
        seller,
        true,
        TOKEN_2022_PROGRAM_ID,
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      );

      try {
        await program.methods
          .makePurchase(intBuffer)
          .accounts({
            customer: publicKey.toBase58(),
            mint: MINT.toBase58(),
            seller: seller.toBase58(),
            sellerAta: sellerAta.toBase58(),
            customerAta: customerAta.toBase58(),
            tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
          })
          .signers([])
          .rpc(); // Generate transaction

        console.log("COMPLETED PURCHASE");
      } catch (error) {
        console.log("getting here");
        toast.error("Transaction failed.");
        console.error(error);
        throw error;
      }
    },
  });

  return mutation;
}

export function useBurnRebu() {
  const provider = useAnchorProvider();
  const { publicKey, signTransaction } = useWallet();
  const programId = getSolanaProgramId();
  const program = getSolanaProgram(provider, programId);

  const mutation = useMutation({
    mutationKey: ["rebuSolana", "burnRebu", { DEVNET }],
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!publicKey || !signTransaction) {
        toast.error("Please connect your wallet.");
        throw new Error("Wallet not connected.");
      }

      const userAta = await getAssociatedTokenAddress(
        MINT,
        publicKey,
        true,
        TOKEN_2022_PROGRAM_ID,
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      );

      try {
        await program.methods
          .burnRebu(amount)
          .accounts({
            signer: publicKey.toBase58(),
            tokenAccount: userAta.toBase58(),
            tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
          })
          .signers([])
          .rpc(); // Generate transaction
      } catch (error) {
        toast.error("Transaction failed.");
        console.error(error);
        throw error;
      }
    },
  });

  return mutation;
}

export async function setPublicKey(token: string, publicKey: string) {
  const response = await fetch(`${API_BASE_URL}/solana/key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(humps.decamelizeKeys({ publicKey: publicKey })),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update user's solana public key: ${response.statusText}`
    );
  }

  return await response.json();
}

export async function getPublicKey(token: string, seller: any) {

  const response = await fetch(`${API_BASE_URL}/solana/seller-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(humps.decamelizeKeys(seller)),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get seller's solana public key: ${response.statusText}`
    );
  }

  return await response.json();
}

export function getBalance(token: string) {
  return fetch(`${API_BASE_URL}/solana/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch a balance: ${response.statusText}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching balance:", error);
      return [];
    });
}
