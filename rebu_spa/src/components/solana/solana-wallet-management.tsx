import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "./solana-provider";
import { API_BASE_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setPublicKey } from "@/lib/api/solana";
import { send } from "process";

export default function WalletSolana() {
  const { publicKey } = useWallet();
  const { data: session } = useSession();

  useEffect(() => {
    if (!publicKey || !session) return;

    const updatePubKey = async () => {
      await setPublicKey(session!.accessToken, publicKey.toBase58());
    };

    if (publicKey.toString() != session.user.solanaPubKey) {
      updatePubKey();
    }
  }, [publicKey]);

  return (
    <div className="pt-6">
      <div className="hero-content text-center">
        <WalletButton />
      </div>
    </div>
  );
}
