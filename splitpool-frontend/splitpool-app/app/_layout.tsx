import { useEffect, Suspense } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { View, ActivityIndicator } from 'react-native';
import { WagmiConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from '@web3modal/wagmi-react-native';

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
const metadata = {
  name: 'SplitPool',
  description: 'Split bills, settle on-chain',
  url: 'https://splitpool.app',
  icons: ['https://splitpool.app/icon.png'],
};
const chains = [baseSepolia];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });
createWeb3Modal({ projectId, chains, wagmiConfig });

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    console.log('SplitPool initialized');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
      <StatusBar style="auto" />
      <ErrorBoundary>
        <Suspense
          fallback={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          }
        >
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
        </Suspense>
      </ErrorBoundary>
      <Web3Modal />
      </WagmiConfig>
    </QueryClientProvider>
  );
}