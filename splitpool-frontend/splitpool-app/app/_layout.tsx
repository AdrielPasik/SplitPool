import { useEffect, Suspense } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { View, ActivityIndicator } from 'react-native';
import { WagmiConfig } from 'wagmi';
import { AppKitProvider, AppKit } from '@reown/appkit-react-native';
import { appKit, wagmiConfig } from '../AppKitConfig';

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
      <AppKitProvider instance={appKit}>
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
          <AppKit />
        </WagmiConfig>
      </AppKitProvider>
    </QueryClientProvider>
  );
}