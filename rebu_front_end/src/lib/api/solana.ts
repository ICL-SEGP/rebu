import humps from "humps";
import { API_BASE_URL } from "../constants";

import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { Cluster, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import RebuSolanaIDLJson from "@/../target/IDL/solanaIDL.json";
import type { RebuSolanaIDL } from "@/types/solanaIDL";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useTransactionToast } from "@/components/ui/solana/account-data-access";
import { useAnchorProvider } from "@/components/ui/solana/solana-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { getAssociatedTokenAddress } from "@solana/spl-token";

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
  name: "devnet",
  endpoint: clusterApiUrl("devnet"),
  network: "devnet",
};

// export function getSolanaProgram(
//   provider: AnchorProvider,
//   address?: PublicKey
// ) {
//   return new Program(
//     {
//       ...RebuSolanaIDLJson,
//       address: address ? address.toBase58() : RebuSolanaIDLJson.address,
//     } as RebuSolanaIDL,
//     provider
//   );
// }

// // This is a helper function to get the program ID for the TestAppSolana program depending on the cluster.
// export function getSolanaProgramId() {
//   return REBU_SOLANA_PROGRAM_ID;
// }

// function test() {}

// function makePurchase(seller, productId, gg) {
//   const { connection } = useConnection();

//   const provider = useAnchorProvider();
//   const programId = getSolanaProgramId();
//   const program = getSolanaProgram(provider, programId);

//   const { data: session } = useSession();

//   const getProgramAccount = useQuery({
//     queryKey: ["get-program-account", { DEVNET }],
//     queryFn: () => connection.getParsedAccountInfo(programId),
//   });

//   const accounts = useQuery({
//     queryKey: ["rebuSolana", "all", { DEVNET }],
//     queryFn: () => program.account.productListing.all(),
//   });

//   const intBuffer = new BN(productId).toArrayLike(Buffer, "le", 8);

//   const [productListingPDA, _bumpListing] = PublicKey.findProgramAddressSync(
//     [
//       Buffer.from("product"),
//       Buffer.from("listing"),
//       seller.toBuffer(),
//       intBuffer,
//     ],
//     programId
//   );

//   const { publicKey } = useWallet();

//   const [productPurchasePDA, _bumpPurchase] = PublicKey.findProgramAddressSync(
//     [
//       Buffer.from("product"),
//       Buffer.from("purchase"),
//       seller.toBuffer(),
//       intBuffer,
//       publicKey!.toBuffer(),
//     ],
//     programId
//   );

//   // In an async function or inside your mutationFn as async
//   // In an async function or inside your mutationFn as async
//   const customerAta = await getAssociatedTokenAddress(
//     session!.mint,
//     publicKey!
//   );
//   const sellerAta = await getAssociatedTokenAddress(session!.mint, seller!);

//   const transactionToast = useTransactionToast();
//   useMutation({
//     mutationKey: ["rebuSolana", "makePurchase", { DEVNET }],
//     mutationFn: (keypair: Keypair) =>
//       program.methods
//         .makePurchase(productId)
//         .accounts({
//           customer: publicKey,
//           mint: session!.mint,
//           seller: seller,
//           seller_ata: sellerAta,
//           customer_ata: customerAta,
//           product_listing: productListingPDA,
//           product_purchase: productPurchasePDA,
//           associated_token_program: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
//           token_program: TOKEN_2022_PROGRAM_ID,
//           system_program: SYSTEM_PROGRAM_ID,
//         })
//         .signers([keypair])
//         .rpc(),
//     onSuccess: (signature) => {
//       transactionToast(signature);
//       await accounts.refetch();
//     },
//     onError: () => toast.error("Failed to make purchase."),
//   });
// }

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
