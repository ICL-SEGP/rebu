import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/ui/crypto/solana-provider';
import { API_BASE_URL } from '@/lib/constants';
import { useSession } from 'next-auth/react';

export default function WalletSolana() {
  const { publicKey } = useWallet();
  const { data: session } = useSession();

  const pushKey = async (key) => {
    if (!session) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/solana/publickey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          public_key: key,
        }),
      });

      if (!res.ok) throw new Error('Failed to push key');

      const response = await res.json();

      console.log(response);
    } catch (error) {
      console.error('Error pushing key', error);
    }
  };

  if (publicKey) {
    pushKey(publicKey);
  }

  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <WalletButton />
      </div>
    </div>
  );
}
