import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlarmProvider } from '@/contexts/AlarmContext';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    const setupNotificationCategories = async () => {
      await Notifications.setNotificationCategoryAsync('alarm', [
        {
          identifier: 'dismiss',
          buttonTitle: 'Dismiss',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
      console.log('Notification categories set up');
    };

    setupNotificationCategories();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AlarmProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="add-alarm"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Add Alarm',
              headerStyle: { backgroundColor: '#1a1a2e' },
              headerTintColor: '#ffffff',
            }}
          />
          <Stack.Screen
            name="multiple-alarms"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Multiple Alarms',
              headerStyle: { backgroundColor: '#1a1a2e' },
              headerTintColor: '#ffffff',
            }}
          />
        </Stack>
      </AlarmProvider>
    </QueryClientProvider>
  );
}
