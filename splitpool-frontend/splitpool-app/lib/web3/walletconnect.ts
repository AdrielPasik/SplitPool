/**
 * WalletConnect / Web3Modal helpers (placeholder)
 * Este archivo estaba con contenido de upload; se reemplaza por helpers mínimos.
 * TODO: Integrar @web3modal/wagmi-react-native y exponer provider/context.
 */

import { createConfig, http } from 'wagmi';
import { baseSepolia } from '../web3/chains';

export interface WalletConnectInitOptions {
  projectId: string;
  metadata?: {
    name: string;
    description?: string;
    url?: string;
    icons?: string[];
  };
}

export const getWagmiConfig = (opts: WalletConnectInitOptions) => {
  // Placeholder connectors; se pueden añadir WalletConnectConnector cuando se instale paquete
  return createConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
  });
};

// Placeholder para abrir modal (por ahora no implementado)
export function openWalletModal(): void {
  // TODO: implementar modal real
  console.warn('openWalletModal() aún no implementado');
}

// Placeholder para obtener provider (retorna null hasta integración real)
export function getWalletProvider(): any | null {
  return null;
}

// ---------------------------------------------------------------------------
// Si se necesita todavía el upload (anterior contenido), se movió a filecoin/upload.ts
// ---------------------------------------------------------------------------

// NOTE: El código de upload vive en filecoin/upload.ts