import humps from "humps";
import { API_BASE_URL } from "../constants";

import * as anchor  from "@coral-xyz/anchor";
import { Cluster, clusterApiUrl, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import RebuSolanaIDLJson from "@/../target/idl/solanaIDL.json";
import type { RebuSolanaIDL } from "@/types/solanaIDL";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useTransactionToast } from "@/components/ui/solana/account-data-access";
import { useAnchorProvider } from "@/components/ui/solana/solana-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

export { RebuSolanaIDL, RebuSolanaIDLJson };

export const REBU_SOLANA_PROGRAM_ID = new PublicKey(RebuSolanaIDLJson.address);

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const TOKEN_2022_PROGRAM_ID: PublicKey = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

const SYSTEM_PROGRAM_ID: PublicKey = new PublicKey(
  "11111111111111111111111111111111"
);

const DEVNET = {
  name: "local",
  endpoint: "http://localhost:8899",
};

export function getSolanaProgram(
  provider: anchor.AnchorProvider,
  address?: PublicKey
) {
  return new anchor.Program(
    {
      ...RebuSolanaIDLJson,
      address: address ? address.toBase58() : RebuSolanaIDLJson.address,
    } as RebuSolanaIDL,
    provider
  );
}

// This is a helper function to get the program ID for the TestAppSolana program depending on the cluster.
export function getSolanaProgramId() {
  return REBU_SOLANA_PROGRAM_ID;
}

function test() {}

export function useMakePurchase() {
  const { connection } = useConnection();
  const provider = useAnchorProvider();
  const { publicKey, signTransaction } = useWallet();
  const { data: session } = useSession();
  const transactionToast = useTransactionToast();
  const programId = getSolanaProgramId();
  const program = getSolanaProgram(provider, programId);

  console.log("START")

  const mutation = useMutation({
    mutationKey: ["rebuSolana", "makePurchase", { DEVNET }],
    mutationFn: async ({ seller_str, productId }: { seller_str: string; productId: number }) => {
      console.log("GOT HERE: 1")
      
      if (!publicKey || !signTransaction) {
        console.log("GOT HERE: :(")

        toast.error("Please connect your wallet.");
        throw new Error("Wallet not connected.");
      }

      console.log("GOT HERE: :)")


      const seller = new PublicKey(seller_str);
      const intBuffer = new anchor.BN(productId) //.toArrayLike(Buffer, "le", 8);

      console.log("GOT HERE: 2")


      const [productListingPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("product"), 
          Buffer.from("listing"), 
          seller.toBuffer(), 
          intBuffer],
        programId
      );
      console.log("GOT HERE 3")


      const [productPurchasePDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("product"), 
          Buffer.from("purchase"), 
          seller.toBuffer(), 
          intBuffer, 
          publicKey.toBuffer()],
        programId
      );
      console.log("GOT HERE 4")

      const mint = new PublicKey("mntSPLHmrFAELUiNxDC31Nm44TofrAs7VXBknPoqiBY");


      const customerAta = await getAssociatedTokenAddress(
        mint,
        publicKey,
        true, 
        TOKEN_2022_PROGRAM_ID,
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      );
      const sellerAta = await getAssociatedTokenAddress(
        mint, 
        seller,
        true, 
        TOKEN_2022_PROGRAM_ID,
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      );

      console.log("Seller:", seller.toBase58())

      console.log("user:", publicKey.toBase58())

      console.log("Seller ATA:", sellerAta.toBase58())
      console.log("User ATA:", customerAta.toBase58())


      try {
        await program.methods
          .makePurchase(intBuffer)
          .accounts({
            customer: publicKey.toBase58(),
            mint: mint.toBase58(),
            seller: seller.toBase58(),
            sellerAta: sellerAta.toBase58(),
            customerAta: customerAta.toBase58(),
            // productListing: productListingPDA.toBase58(),
            // productPurchase: productPurchasePDA.toBase58(),
            // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toBase58(),
            tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
            // systemProgram: SYSTEM_PROGRAM_ID.toBase58() 
          })
          .signers([])
          .rpc(); // Generate transaction

          console.log("HEREEEE")

        // transaction.feePayer = publicKey;
        // transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        // // Sign the transaction using the connected wallet
        // const signedTransaction = await signTransaction(transaction);

        // Send the signed transaction to the network
        // const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log("COMPLETED TRANSACTION")
        // transactionToast(signature); // Show success notification
        // return signature;
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
