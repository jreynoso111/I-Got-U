import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Screen, Card, Text } from '@/components/Themed';
import { MessageCircle, FileText, Shield, CircleHelp, ChevronRight, Wallet } from 'lucide-react-native';

export default function HelpSupportScreen() {
  const router = useRouter();

  const items = [
    {
      icon: CircleHelp,
      label: 'FAQ',
      sub: 'Current flows and common questions',
      onPress: () => router.push('/faq'),
    },
    {
      icon: Wallet,
      label: 'Payments & adjustments',
      sub: 'How Add payment and Adjust total work today',
      onPress: () =>
        Alert.alert(
          'Payments & adjustments',
          'Use "Add payment" to log money or item returns. Use "Adjust total" to correct the original amount without deleting payment history. Shared records may require confirmation as "Suggest new total".'
        ),
    },
    {
      icon: MessageCircle,
      label: 'Using contacts',
      sub: 'Contact details, recent activity, and history',
      onPress: () =>
        Alert.alert(
          'Using contacts',
          'Tap a contact row to expand it. The expanded view now shows a compact contact snapshot, recent activity, open records, and a "View history" button.'
        ),
    },
    {
      icon: FileText,
      label: 'Terms of Service',
      sub: 'Read in app',
      onPress: () => router.push('/terms'),
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      sub: 'Read in app',
      onPress: () => router.push('/privacy'),
    },
  ];

  return (
    <Screen style={styles.container}>
      <Stack.Screen options={{ title: 'Help & Support' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <Text style={styles.heroTitle}>Updated guidance</Text>
          <Text style={styles.heroText}>
            Help is kept aligned with the current app so the language and steps match the real buttons you see on screen.
          </Text>
        </Card>

        <Card style={styles.menuCard}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.item, index === items.length - 1 && styles.lastItem]}
              onPress={item.onPress}
            >
              <RNView style={styles.itemLeft}>
                <RNView style={styles.iconCircle}>
                  <item.icon size={18} color="#6366F1" />
                </RNView>
                <RNView style={styles.textContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.subLabel}>{item.sub}</Text>
                </RNView>
              </RNView>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </Card>

        <Text style={styles.footer}>IOUTrack v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 120,
    paddingBottom: 40,
  },
  heroCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textContainer: {
    marginLeft: 14,
    flex: 1,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  subLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    textAlign: 'center',
    marginTop: 18,
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
});
