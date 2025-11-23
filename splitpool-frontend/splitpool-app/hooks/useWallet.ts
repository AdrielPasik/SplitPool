import { useEffect, useState } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import { useWalletStore } from '../store/wallet';
import type { Address } from '../types/models';

export function useWallet(): {
  address: Address | null;
  isConnected: boolean;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  walletProvider: any | null;
} {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();

  const { 
    address: storeAddress, 
    isConnected: storeIsConnected,
    connect: storeConnect,
    disconnect: storeDisconnect 
  } = useWalletStore();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address && address !== storeAddress) {
      storeConnect(address as Address);
    } else if (!isConnected && storeIsConnected) {
      storeDisconnect();
    }
  }, [isConnected, address, storeAddress, storeIsConnected, storeConnect, storeDisconnect]);

  const connect = async () => {
    setLoading(true);
    try {
      await open();
    } finally {
      setLoading(false);
    }
  };

  const doDisconnect = async () => {
    setLoading(true);
    try {
      await disconnect();
      storeDisconnect();
    } finally {
      setLoading(false);
    }
  };

  return {
    address: (address ?? null) as Address | null,
    isConnected,
    loading,
    connect,
    disconnect: doDisconnect,
    walletProvider: walletClient ?? null,
  };
}