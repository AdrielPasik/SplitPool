import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultConfig, Web3Modal } from '@walletconnect/modal-react-native';
import { baseSepolia } from '../lib/web3/chains';

// Configuración de WalletConnect
const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

const metadata = {
  name: 'SplitPool',
  description: 'Split bills, settle on-chain',
  url: 'https://splitpool.app',
  icons: ['https://splitpool.app/icon.png'],
  redirect: {
    native: 'splitpool://',
    universal: 'https://splitpool.app',
  },
};

const config = defaultConfig({
  metadata,
});

// Crear Web3Modal
createWeb3Modal({
  projectId,
  chains: [baseSepolia],
  config,
});

// Crear QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Configuración inicial de la app
    console.log('SplitPool initialized');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="pools/[id]" 
          options={{ 
            presentation: 'card',
            animation: 'slide_from_right' 
          }} 
        />
        <Stack.Screen 
          name="pools/create" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom' 
          }} 
        />
        <Stack.Screen 
          name="pools/pay" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom' 
          }} 
        />
        <Stack.Screen 
          name="groups/[id]" 
          options={{ 
            presentation: 'card',
            animation: 'slide_from_right' 
          }} 
        />
        <Stack.Screen 
          name="groups/create" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom' 
          }} 
        />
        <Stack.Screen 
          name="groups/settle" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom' 
          }} 
        />
        <Stack.Screen 
          name="groups/expense/create" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom' 
          }} 
        />
        <Stack.Screen 
          name="groups/expense/[id]" 
          options={{ 
            presentation: 'card',
            animation: 'slide_from_right' 
          }} 
        />
      </Stack>
      <Web3Modal />
    </QueryClientProvider>
  );
}