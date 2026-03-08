import React from 'react';
import { Platform, ScrollView, StyleSheet, View as RNView } from 'react-native';
import { Check, Shield, Smartphone } from 'lucide-react-native';

import { Card, Screen, Text } from '@/components/Themed';
import { getBillingEntitlementId, getBillingUnavailableReason, isBillingAvailable } from '@/services/billing';
import { PLAN_LIMITS } from '@/services/subscriptionPlan';
import { formatReferralExpiry, getMyInviteSummary } from '@/services/referrals';
import { useAuthStore } from '@/store/authStore';

export default function SubscriptionScreen() {
  const planTier = useAuthStore((state) => state.planTier);
  const planTitle = planTier === 'premium' ? 'Premium active' : 'Free plan';
  const unavailableReason = getBillingUnavailableReason();
  const [referralSummary, setReferralSummary] = React.useState<{
    referralCount: number;
    premiumReferralExpiresAt: string | null;
  } | null>(null);

  React.useEffect(() => {
    let active = true;

    const loadReferralSummary = async () => {
      const { data } = await getMyInviteSummary();
      if (!active || !data) return;
      setReferralSummary({
        referralCount: data.referralCount,
        premiumReferralExpiresAt: data.premiumReferralExpiresAt,
      });
    };

    void loadReferralSummary();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.heroCard}>
          <RNView style={styles.heroIcon}>
            <Smartphone size={22} color="#6366F1" />
          </RNView>
          <Text style={styles.heroEyebrow}>Plan</Text>
          <Text style={styles.heroTitle}>{planTitle}</Text>
          <Text style={styles.heroText}>
            Buddy Balance Pro removes the friend and active record limits. Android checkout will be handled directly by Google
            Play.
          </Text>
        </Card>

        <Card style={styles.compareCard}>
          <Text style={styles.sectionTitle}>What Buddy Balance Pro unlocks</Text>
          {[
            `Unlimited linked friends instead of ${PLAN_LIMITS.free.linkedFriends}`,
            `Unlimited active records instead of ${PLAN_LIMITS.free.activeRecords}`,
            'Priority support for account issues',
            '1 free month of Premium every 3 successful invite code uses',
            `Premium plan tier: "${getBillingEntitlementId()}"`,
          ].map((benefit) => (
            <RNView key={benefit} style={styles.benefitRow}>
              <RNView style={styles.benefitIcon}>
                <Check size={14} color="#10B981" />
              </RNView>
              <Text style={styles.benefitText}>{benefit}</Text>
            </RNView>
          ))}
        </Card>

        <Card style={styles.stateCard}>
          <RNView style={styles.statusIcon}>
            <Shield size={20} color="#1E293B" />
          </RNView>
          <Text style={styles.stateTitle}>Direct store billing is not live yet</Text>
          <Text style={styles.stateText}>
            {isBillingAvailable()
              ? 'Google Play will handle Premium purchases directly. Until that checkout is wired, admins can switch users between Free and Premium from the admin dashboard.'
              : unavailableReason}
          </Text>
          <Text style={styles.stateFootnote}>
            Current status: Premium access is controlled by `profiles.plan_tier` and can still be managed manually by an
            administrator.
          </Text>
          {referralSummary ? (
            <Text style={styles.androidHint}>
              {referralSummary.premiumReferralExpiresAt
                ? `Referral Premium active until ${formatReferralExpiry(referralSummary.premiumReferralExpiresAt)}.`
                : `${referralSummary.referralCount}/3 invite code uses earned toward your next free Premium month.`}
            </Text>
          ) : null}
          {Platform.OS === 'android' ? (
            <Text style={styles.androidHint}>
              Next step for Android: connect the Google Play in-app product and wire the purchase flow into this screen.
            </Text>
          ) : null}
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
    paddingTop: 32,
    paddingBottom: 48,
    gap: 16,
  },
  heroCard: {
    padding: 20,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginBottom: 12,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#6366F1',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  heroText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#64748B',
  },
  compareCard: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    marginTop: 1,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    color: '#334155',
  },
  stateCard: {
    padding: 20,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  stateText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  stateFootnote: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },
  androidHint: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
    color: '#6366F1',
    fontWeight: '700',
  },
});
