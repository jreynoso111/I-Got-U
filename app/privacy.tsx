import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, type Href } from 'expo-router';
import { Screen, Card, Text } from '@/components/Themed';
import { PublicSiteLayout } from '@/components/website/PublicSiteLayout';

const POLICY_PARAGRAPHS = [
  'This Privacy Policy describes how Buddy Balance collects, uses, stores, protects, and otherwise handles information when you access or use the Buddy Balance application, related website experiences, and public or in-app support pages. Buddy Balance is operated by Caribbean Insides. By creating an account, accessing the service, or continuing to use any part of the product, you acknowledge that information may be processed in the manner described in this policy. Buddy Balance is a recordkeeping and coordination product for shared financial and item-tracking activity; it is not a bank, payment processor, escrow provider, money transmitter, or debt collection service, and this policy should be read in that context.',
  'The information collected through Buddy Balance may include data you provide directly and data generated through use of the product. Depending on how you use the service, that information may include account identifiers, sign-in details, profile data, names, contact information, contacts you create or connect, loan records, payment history, item return history, confirmations, requests, notifications, support communications, preferences, and technical or usage-related metadata necessary to operate the service. We may also maintain timestamps, device-related signals, session-related information, and records of actions taken within the product where doing so is reasonably necessary to keep the service functional, secure, traceable, and consistent across shared user experiences.',
  'Buddy Balance uses this information for legitimate operational purposes connected to the service. Those purposes include creating and maintaining user accounts, authenticating access, displaying balances and shared history, processing updates to records, preserving timeline accuracy, enabling confirmations and notifications, supporting referrals or plan features where applicable, responding to support requests, preventing misuse, troubleshooting errors, monitoring product reliability, and improving the quality, safety, and performance of the service. Information may also be used where reasonably necessary to enforce the applicable terms, comply with legal obligations, protect the rights or security of the service, and maintain the integrity of records that users rely on inside the product.',
  'Because Buddy Balance is built around shared recordkeeping between connected users, certain information is visible by design to the participants involved in a shared interaction. When you create, update, confirm, or otherwise engage with a record that involves another user, the service may display relevant information about that activity to the connected participant so the shared record can function as intended. This may include record details, balances, payment or return history, requests, confirmations, and event timelines associated with that interaction. Users should therefore avoid entering information they do not want reflected in the ordinary operation of a shared record, since visibility to the relevant participant is a core feature of the product rather than an incidental disclosure.',
  'If you contact Buddy Balance support, the information you submit may be used together with associated account and product context to investigate issues, answer questions, verify requests, resolve technical problems, review account-related concerns, and improve the support experience. Support-related information may be retained for follow-up, continuity, fraud prevention, product quality review, and recordkeeping purposes. Where appropriate, requests involving access, corrections, account recovery, or deletion review may require verification before action is taken, particularly where the request could affect shared records, account security, or the integrity of historical activity stored in the service.',
  'Buddy Balance may rely on third-party service providers and infrastructure partners to support functions such as hosting, authentication, storage, networking, security, and related technical operations required to run the service. Those providers may process information on behalf of Caribbean Insides only to the extent reasonably necessary to provide infrastructure or operational support for the product. Information may also be disclosed if reasonably necessary to comply with applicable law, legal process, enforceable governmental request, or to protect the rights, safety, security, and integrity of the service, its operator, or its users. Aside from those circumstances and the ordinary participant visibility inherent in shared records, this policy does not intend to expand disclosure rights beyond what is required to operate the product responsibly.',
  'Information is retained for as long as reasonably necessary to provide the service, preserve shared record history, maintain continuity between participants, respond to support matters, investigate disputes, protect against abuse, comply with legal obligations, and enforce the rules that apply to the product. Because Buddy Balance includes collaborative and historical recordkeeping, deletion may not always mean immediate erasure of every data point from every operational context, especially where retention is needed to preserve the integrity of shared activity or to resolve outstanding support, safety, legal, or operational issues. Users may request account review, corrections, or deletion-related assistance through available support channels, and any such request may be subject to verification and reasonable processing requirements.',
  'Caribbean Insides uses reasonable technical and organizational safeguards designed to help protect information from unauthorized access, misuse, alteration, loss, or disclosure. Even so, no online platform, transmission channel, or storage system can be guaranteed to be completely secure, and Buddy Balance cannot promise absolute security. The service is not intended for children who are below the minimum age required under applicable law to use the product. We may update this Privacy Policy from time to time to reflect changes in product functionality, operational practices, legal requirements, or business structure. When an updated version is published, the revised policy will apply from the time it becomes effective, and continued use of the service after that point will be treated as acceptance of the updated policy to the extent permitted by law.',
] as const;

export default function PrivacyPolicyScreen() {
  if (Platform.OS === 'web') {
    return (
      <PublicSiteLayout
        hideHero
        title="Privacy Policy for Buddy Balance"
        description="Please review this Privacy Policy carefully before using Buddy Balance."
        actions={[
          { href: '/help-support', label: 'Back to Support' },
          { href: '/contact' as Href, label: 'Contact support', variant: 'secondary' },
        ]}
      >
        <View style={styles.documentHeader}>
          <Text style={styles.documentTitle}>Buddy Balance Privacy Policy</Text>
          <Text style={styles.documentMeta}>Operated by Caribbean Insides</Text>
        </View>

        <View style={styles.documentCard}>
          {POLICY_PARAGRAPHS.map((paragraph, index) => (
            <Text key={index} style={styles.documentParagraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      </PublicSiteLayout>
    );
  }

  return (
    <Screen style={styles.container}>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.mobileHeaderCard}>
          <Text style={styles.mobileHeaderTitle}>Buddy Balance Privacy Policy</Text>
          <Text style={styles.mobileHeaderMeta}>Operated by Caribbean Insides</Text>
        </Card>

        <Card style={styles.mobileDocumentCard}>
          {POLICY_PARAGRAPHS.map((paragraph, index) => (
            <Text key={index} style={[styles.mobileDocumentParagraph, index === POLICY_PARAGRAPHS.length - 1 && styles.mobileDocumentParagraphLast]}>
              {paragraph}
            </Text>
          ))}
        </Card>
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
  documentHeader: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    paddingBottom: 6,
  },
  documentTitle: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    color: '#111827',
  },
  documentMeta: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  documentCard: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    padding: 30,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.8)',
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  documentParagraph: {
    fontSize: 13,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 18,
    textAlign: 'justify',
  },
  mobileHeaderCard: {
    padding: 20,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mobileHeaderTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  mobileHeaderMeta: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#64748B',
  },
  mobileDocumentCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  mobileDocumentParagraph: {
    fontSize: 13,
    lineHeight: 22,
    color: '#334155',
    marginBottom: 16,
    textAlign: 'justify',
  },
  mobileDocumentParagraphLast: {
    marginBottom: 0,
  },
});
