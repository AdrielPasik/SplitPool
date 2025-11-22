import { useEffect, useState } from 'react';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@walletconnect/modal-react-native';
import { useWalletStore } from '../store/wallet';
import type { Address } from '../types/models';

export function useWallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  
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
      await open();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      storeDisconnect();
      // WalletConnect modal maneja el disconnect internamente
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    address: (address as Address) || null,
    isConnected,
    loading,
    connect,
    disconnect,
    walletProvider,
  };
}