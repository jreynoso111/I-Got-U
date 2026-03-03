import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/hooks/useI18n';

export default function AdminLayout() {
  const { role, initialized } = useAuthStore();
  const { t } = useI18n();
  const normalizedRole = (role || '').toLowerCase().trim();

  if (!initialized) return null;

  if (normalizedRole !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '800' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: t('Admin Dashboard') }} />
      <Stack.Screen name="users" options={{ title: t('Platform Users') }} />
      <Stack.Screen name="loans" options={{ title: t('Platform Lend/Borrow') }} />
    </Stack>
  );
}
