import '@walletconnect/react-native-compat'; // must be first
import { createAppKit } from '@reown/appkit-react-native';
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import { baseSepolia } from 'wagmi/chains';

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const metadata = {
  name: 'SplitPool',
  description: 'Split bills, settle on‑chain',
  url: 'https://splitpool.app',
  icons: ['https://splitpool.app/icon.png'],
  redirect: {
    native: 'splitpool://',
    universal: 'splitpool.app',
  },
};

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [baseSepolia],
});

export const appKit = createAppKit({
  projectId,
  metadata,
  networks: [baseSepolia],
  adapters: [wagmiAdapter],
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
