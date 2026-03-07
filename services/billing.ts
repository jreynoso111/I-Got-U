import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

import { supabase } from '@/services/supabase';
import { PlanTier } from '@/services/subscriptionPlan';

function getExpoExtra() {
  const constants = Constants as any;
  return (
    Constants.expoConfig?.extra ||
    constants.manifest2?.extra?.expoClient?.extra ||
    constants.manifest?.extra ||
    {}
  );
}

function readBillingConfig(name: string, extraValue?: unknown, fallback = '') {
  const envValue = process.env[name];
  if (typeof envValue === 'string' && envValue.trim()) {
    return envValue.trim();
  }

  if (typeof extraValue === 'string' && extraValue.trim()) {
    return extraValue.trim();
  }

  return fallback;
}

const expoExtra = getExpoExtra();
const revenueCatExtra = (expoExtra?.revenueCat || {}) as {
  iosApiKey?: string;
  androidApiKey?: string;
  entitlementId?: string;
  offeringId?: string;
};

const REVENUECAT_IOS_API_KEY = readBillingConfig(
  'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY',
  revenueCatExtra.iosApiKey,
  ''
);
const REVENUECAT_ANDROID_API_KEY = readBillingConfig(
  'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY',
  revenueCatExtra.androidApiKey,
  ''
);
const REVENUECAT_ENTITLEMENT_ID = readBillingConfig(
  'EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID',
  revenueCatExtra.entitlementId,
  'premium'
);
const REVENUECAT_OFFERING_ID = readBillingConfig(
  'EXPO_PUBLIC_REVENUECAT_OFFERING_ID',
  revenueCatExtra.offeringId,
  ''
);

function getRevenueCatEntitlementCandidates() {
  return Array.from(
    new Set(
      REVENUECAT_ENTITLEMENT_ID
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function getPrimaryRevenueCatEntitlementId() {
  return getRevenueCatEntitlementCandidates()[0] || 'ioutrack pro';
}

function resolveActiveEntitlement(customerInfo?: CustomerInfo | null) {
  const active = customerInfo?.entitlements?.active || {};
  for (const candidate of getRevenueCatEntitlementCandidates()) {
    const entitlement = active?.[candidate];
    if (entitlement?.isActive) {
      return entitlement;
    }
  }

  return null;
}

type BillingUser = {
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  displayName?: string | null;
};

type BillingSyncResult = {
  planTier: PlanTier;
  synced: boolean;
  error?: string;
};

const customerInfoSubscribers = new Set<(customerInfo: CustomerInfo) => void>();
let customerInfoListenerRegistered = false;

function getRevenueCatApiKey() {
  if (Platform.OS === 'ios') return REVENUECAT_IOS_API_KEY;
  if (Platform.OS === 'android') return REVENUECAT_ANDROID_API_KEY;
  return '';
}

function registerCustomerInfoListener() {
  if (customerInfoListenerRegistered || !isBillingAvailable()) {
    return;
  }

  Purchases.addCustomerInfoUpdateListener((customerInfo) => {
    customerInfoSubscribers.forEach((subscriber) => subscriber(customerInfo));
  });
  customerInfoListenerRegistered = true;
}

async function syncSubscriberAttributes({ email, phone, displayName }: BillingUser) {
  const tasks: Promise<unknown>[] = [];

  if (typeof email === 'string') {
    tasks.push(Purchases.setEmail(email.trim() || null));
  }
  if (typeof phone === 'string') {
    tasks.push(Purchases.setPhoneNumber(phone.trim() || null));
  }
  if (typeof displayName === 'string') {
    tasks.push(Purchases.setDisplayName(displayName.trim() || null));
  }

  if (tasks.length === 0) {
    return;
  }

  await Promise.allSettled(tasks);
}

export function isBillingAvailable() {
  return Platform.OS !== 'web' && !!getRevenueCatApiKey() && !!REVENUECAT_ENTITLEMENT_ID;
}

export function getBillingUnavailableReason() {
  if (Platform.OS === 'web') {
    return 'Purchases are only available in the native iOS and Android builds.';
  }
  if (!REVENUECAT_ENTITLEMENT_ID) {
    return 'Missing RevenueCat entitlement id.';
  }
  if (!getRevenueCatApiKey()) {
    return Platform.OS === 'ios'
      ? 'Missing EXPO_PUBLIC_REVENUECAT_IOS_API_KEY.'
      : 'Missing EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY.';
  }

  return null;
}

export function getBillingEntitlementId() {
  return getPrimaryRevenueCatEntitlementId();
}

export function getPlanTierFromCustomerInfo(customerInfo?: CustomerInfo | null): PlanTier {
  const entitlement = resolveActiveEntitlement(customerInfo);
  return entitlement?.isActive ? 'premium' : 'free';
}

export function subscribeToBillingCustomerInfo(listener: (customerInfo: CustomerInfo) => void) {
  if (!isBillingAvailable()) {
    return () => {};
  }

  registerCustomerInfoListener();
  customerInfoSubscribers.add(listener);

  return () => {
    customerInfoSubscribers.delete(listener);
  };
}

export async function configureBillingForUser(user: BillingUser) {
  if (!isBillingAvailable()) {
    return null;
  }

  registerCustomerInfoListener();

  const configured = await Purchases.isConfigured();
  const apiKey = getRevenueCatApiKey();
  const nextUserId = user.userId?.trim() || null;

  if (!configured) {
    await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
    Purchases.configure({
      apiKey,
      appUserID: nextUserId || undefined,
    });
  } else {
    const currentAppUserId = await Purchases.getAppUserID().catch(() => null);

    if (nextUserId && currentAppUserId !== nextUserId) {
      await Purchases.logIn(nextUserId);
    } else if (!nextUserId && currentAppUserId) {
      await Purchases.logOut();
    }
  }

  await syncSubscriberAttributes(user);
  return Purchases.getCustomerInfo();
}

export async function fetchPremiumOffering() {
  if (!isBillingAvailable()) {
    return { offering: null as PurchasesOffering | null, featuredPackage: null as PurchasesPackage | null };
  }

  const offerings = await Purchases.getOfferings();
  const offering = REVENUECAT_OFFERING_ID
    ? offerings.all?.[REVENUECAT_OFFERING_ID] || null
    : offerings.current;

  return {
    offering,
    featuredPackage: pickFeaturedPackage(offering),
  };
}

export function pickFeaturedPackage(offering?: PurchasesOffering | null) {
  if (!offering) {
    return null;
  }

  return (
    offering.lifetime ||
    offering.annual ||
    offering.monthly ||
    offering.weekly ||
    offering.availablePackages?.[0] ||
    null
  );
}

export function describePackage(aPackage?: PurchasesPackage | null) {
  if (!aPackage) {
    return '';
  }

  const period = aPackage.product.subscriptionPeriod;
  if (aPackage.packageType === Purchases.PACKAGE_TYPE.LIFETIME || !period) {
    return 'Lifetime access';
  }
  if (period === 'P1Y') return 'Billed yearly';
  if (period === 'P1M') return 'Billed monthly';
  if (period === 'P1W') return 'Billed weekly';

  return 'Premium access';
}

export async function syncPlanTierFromBillingServer(): Promise<BillingSyncResult> {
  const localPlan = await getLocalBillingPlanTier();

  if (!isBillingAvailable()) {
    return {
      planTier: localPlan,
      synced: false,
      error: getBillingUnavailableReason() || 'Billing is unavailable.',
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {
      planTier: localPlan,
      synced: false,
      error: 'No authenticated session found for billing sync.',
    };
  }

  const { data, error } = await supabase.functions.invoke('revenuecat-sync', {
    body: { source: 'client' },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    return {
      planTier: localPlan,
      synced: false,
      error: error.message,
    };
  }

  const normalizedPlan = String((data as any)?.planTier || '').toLowerCase() === 'premium' ? 'premium' : 'free';

  return {
    planTier: normalizedPlan,
    synced: true,
  };
}

export async function purchasePremiumPackage(aPackage: PurchasesPackage) {
  const result = await Purchases.purchasePackage(aPackage);
  const serverSync = await syncPlanTierFromBillingServer();

  return {
    customerInfo: result.customerInfo,
    planTier: serverSync.planTier || getPlanTierFromCustomerInfo(result.customerInfo),
    synced: serverSync.synced,
    error: serverSync.error,
  };
}

export async function restorePremiumAccess() {
  const customerInfo = await Purchases.restorePurchases();
  const serverSync = await syncPlanTierFromBillingServer();

  return {
    customerInfo,
    planTier: serverSync.planTier || getPlanTierFromCustomerInfo(customerInfo),
    synced: serverSync.synced,
    error: serverSync.error,
  };
}

export async function getLocalBillingPlanTier() {
  if (!isBillingAvailable()) {
    return 'free' as PlanTier;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return getPlanTierFromCustomerInfo(customerInfo);
  } catch {
    return 'free' as PlanTier;
  }
}
