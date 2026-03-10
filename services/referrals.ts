import { supabase } from '@/services/supabase';

export type InviteSummary = {
  inviteCode: string;
  referralCount: number;
  referralsUntilNextReward: number;
  nextRewardAtUses: number;
  rewardCyclesAwarded: number;
  premiumReferralExpiresAt: string | null;
  referredByUserId: string | null;
  referredByCode: string | null;
  hasUnseenReward: boolean;
  latestRewardAt: string | null;
};

export type ReferralRewardPayload = {
  rewardMonths: number;
  referralCount: number;
  premiumExpiresAt: string | null;
};

export type PendingPremiumCelebration = {
  source: 'referral' | 'purchase' | 'admin';
  grantedAt: string | null;
  premiumReferralExpiresAt: string | null;
  referralCount: number;
  rewardMonths: number;
  hasPending: boolean;
};

function normalizeInviteSummary(row: any): InviteSummary | null {
  if (!row) return null;

  return {
    inviteCode: String(row.invite_code || '').trim(),
    referralCount: Number(row.referral_count || 0),
    referralsUntilNextReward: Number(row.referrals_until_next_reward || 3),
    nextRewardAtUses: Number(row.next_reward_at_uses || 3),
    rewardCyclesAwarded: Number(row.reward_cycles_awarded || 0),
    premiumReferralExpiresAt: row.premium_referral_expires_at || null,
    referredByUserId: row.referred_by_user_id || null,
    referredByCode: row.referred_by_code || null,
    hasUnseenReward: Boolean(row.has_unseen_reward),
    latestRewardAt: row.latest_reward_at || null,
  };
}

function normalizePendingPremiumCelebration(row: any): PendingPremiumCelebration | null {
  if (!row) return null;

  const source = String(row.source || '').trim();
  if (source !== 'referral' && source !== 'purchase' && source !== 'admin') {
    return null;
  }

  return {
    source,
    grantedAt: row.granted_at || null,
    premiumReferralExpiresAt: row.premium_referral_expires_at || null,
    referralCount: Number(row.referral_count || 0),
    rewardMonths: Number(row.reward_months || 0),
    hasPending: Boolean(row.has_pending),
  };
}

function shouldIgnoreReferralSeenError(error: unknown) {
  const message = String((error as any)?.message || error || '').toLowerCase();
  return (
    message.includes('status 404') ||
    message.includes('not found') ||
    message.includes('could not find the function') ||
    message.includes('function') && message.includes('does not exist')
  );
}

export function formatReferralExpiry(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function getMyInviteSummary(): Promise<{
  data: InviteSummary | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.rpc('get_my_invite_summary');
    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      data: normalizeInviteSummary(row),
      error: null,
    };
  } catch (error: any) {
    return { data: null, error: new Error(error?.message || 'Could not load invite summary.') };
  }
}

export async function applyInvitationCode(code: string): Promise<{
  data: ReferralRewardPayload | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.rpc('apply_invitation_code', {
      p_code: code,
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const payload = Array.isArray(data) ? data[0] : data;

    return {
      data: payload
        ? {
            rewardMonths: Number(payload.reward_months || 0),
            referralCount: Number(payload.referral_count || 0),
            premiumExpiresAt: payload.premium_expires_at || null,
          }
        : null,
      error: null,
    };
  } catch (error: any) {
    return { data: null, error: new Error(error?.message || 'Could not apply invite code.') };
  }
}

export async function markLatestReferralRewardSeen(): Promise<Error | null> {
  try {
    const { error } = await supabase.rpc('mark_latest_referral_reward_seen');
    if (shouldIgnoreReferralSeenError(error)) {
      return null;
    }
    return error ? new Error(error.message) : null;
  } catch (error: any) {
    if (shouldIgnoreReferralSeenError(error)) {
      return null;
    }
    return new Error(error?.message || 'Could not mark referral reward as seen.');
  }
}

export async function getMyPendingPremiumCelebration(): Promise<{
  data: PendingPremiumCelebration | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.rpc('get_my_pending_premium_celebration');
    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const row = Array.isArray(data) ? data[0] : data;

    return {
      data: normalizePendingPremiumCelebration(row),
      error: null,
    };
  } catch (error: any) {
    return { data: null, error: new Error(error?.message || 'Could not load premium celebration state.') };
  }
}

export async function markPremiumCelebrationSeen(): Promise<Error | null> {
  try {
    const { error } = await supabase.rpc('mark_premium_celebration_seen');
    if (shouldIgnoreReferralSeenError(error)) {
      return null;
    }
    return error ? new Error(error.message) : null;
  } catch (error: any) {
    if (shouldIgnoreReferralSeenError(error)) {
      return null;
    }
    return new Error(error?.message || 'Could not mark premium celebration as seen.');
  }
}
