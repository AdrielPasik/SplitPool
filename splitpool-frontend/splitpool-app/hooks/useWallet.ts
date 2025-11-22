import { useEffect, useState } from 'react';
// Removed WalletConnect modal hooks (`useWeb3Modal`, `useWeb3ModalAccount`) – not exported in current version.
// TODO: Integrate a proper wallet solution (e.g. `@web3modal/wagmi-react-native` or wagmi connectors) and replace placeholders below.
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
  // Placeholder connection state until real wallet integration.
  const address: string | null = null;
  const isConnected = false;
  // Placeholder until provider hook is available (wagmi/react-native or ethers adapter)
  const walletProvider: any | null = null; // TODO: set from connection context
  
  const { 
    address: storeAddress, 
    isConnected: storeIsConnected,
    connect: storeConnect,
    disconnect: storeDisconnect 
  } = useWalletStore();

  const [loading, setLoading] = useState(false);

  // Sincronizar con store cuando cambia la conexión
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
      // TODO: invoke wallet modal/connect function
      throw new Error('Wallet connect not implemented');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      storeDisconnect();
      // WalletConnect modal maneja el disconnect internamente
    } finally {
      setLoading(false);
    }
  };

  return {
    address: address as Address | null,
    isConnected,
    loading,
    connect,
    disconnect,
    walletProvider,
  };
}