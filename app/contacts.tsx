import React from 'react';
import { Platform } from 'react-native';
import { Redirect } from 'expo-router';

import ContactsScreen from '@/components/contacts/ContactsScreen';

export default function ContactsRoute() {
  if (Platform.OS !== 'web') {
    return <Redirect href={'/(tabs)/contacts' as any} />;
  }

  return <ContactsScreen />;
}
