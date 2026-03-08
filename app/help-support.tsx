import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Screen, Card, Text } from '@/components/Themed';
import { MessageCircle, FileText, Shield, CircleHelp, ChevronRight, Wallet } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  const submitSupportMessage = async () => {
    if (!user?.id) {
      Alert.alert('Sign in required', 'You need to be signed in to contact support.');
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      Alert.alert('Message required', 'Write a short message so support knows what you need.');
      return;
    }

    setSending(true);
    const { error } = await supabase.from('support_messages').insert([
      {
        user_id: user.id,
        channel: 'in_app',
        subject: subject.trim() || null,
        message: trimmedMessage,
        status: 'open',
      },
    ]);
    setSending(false);

    if (error) {
      Alert.alert('Could not send', error.message);
      return;
    }

    setSubject('');
    setMessage('');
    Alert.alert('Message sent', 'Support communication was recorded successfully.');
  };

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

        <Card style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact support</Text>
          <Text style={styles.contactText}>
            Send a message from inside the app. This creates a support communication record that admins can review.
          </Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject (optional)"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Describe the issue or question..."
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.textarea]}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => void submitSupportMessage()} disabled={sending}>
            <Text style={styles.sendButtonText}>{sending ? 'Sending...' : 'Send to support'}</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.footer}>Buddy Balance v1.0.0</Text>
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
  contactCard: {
    marginTop: 16,
    padding: 18,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  contactText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  textarea: {
    minHeight: 120,
  },
  sendButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
