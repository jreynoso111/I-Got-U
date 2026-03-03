import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { getOrCreateUserPreferences } from '@/services/userPreferences';
import { supabase } from '@/services/supabase';

const isWeb = Platform.OS === 'web';

async function ensureAndroidNotificationChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
}

function isMissingPushTokenColumn(message?: string) {
    return String(message || '').toLowerCase().includes('push_token');
}

async function savePushToken(userId: string, token: string | null) {
    if (!userId) return;

    const { error } = await supabase
        .from('profiles')
        .update({ push_token: token, updated_at: new Date().toISOString() })
        .eq('id', userId);

    // Keep compatibility with DBs that do not yet include push_token.
    if (error && !isMissingPushTokenColumn(error.message)) {
        console.warn('Failed to save push token:', error.message);
    }
}

export async function getPushPermissionStatus() {
    if (isWeb) return 'granted' as const;
    const { status } = await Notifications.getPermissionsAsync();
    return status;
}

export async function registerForPushNotificationsAsync(options?: {
    requestPermission?: boolean;
    userId?: string;
}) {
    const requestPermission = options?.requestPermission ?? true;
    let token: string | null = null;

    if (!Device.isDevice && !isWeb) {
        return null;
    }

    await ensureAndroidNotificationChannel();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted' && requestPermission) {
        const permissionResult = await Notifications.requestPermissionsAsync();
        finalStatus = permissionResult.status;
    }

    if (finalStatus !== 'granted') {
        if (requestPermission) {
            Alert.alert('Push notifications are disabled', 'Enable notifications in system settings to receive alerts.');
        }
        return null;
    }

    if (!isWeb) {
        token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
        token = 'web-local';
    }

    if (options?.userId) {
        await savePushToken(options.userId, token);
    }

    return token;
}

export async function disablePushNotifications(userId?: string) {
    await clearAllLoanReminders();
    if (userId) {
        await savePushToken(userId, null);
    }
}

export async function clearAllLoanReminders() {
    if (isWeb) return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const targets = scheduled.filter((item) => {
        const data = (item.content?.data || {}) as Record<string, any>;
        return data.kind === 'loan_reminder' || typeof data.loanId === 'string';
    });

    await Promise.all(targets.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export async function cancelLoanReminders(loanId: string) {
    if (isWeb || !loanId) return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const targets = scheduled.filter((item) => {
        const data = (item.content?.data || {}) as Record<string, any>;
        return data.loanId === loanId;
    });

    await Promise.all(targets.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export async function scheduleLoanReminder(
    loanId: string,
    contactName: string,
    amount: number,
    dueDate: string,
    category: 'money' | 'item' = 'money',
    frequency: string = 'none',
    interval: number = 1
) {
    if (isWeb) return null;

    const triggerDate = new Date(dueDate);
    triggerDate.setHours(9, 0, 0, 0);

    const body = category === 'money'
        ? `Reminder: ${contactName} owes you $${amount.toLocaleString()}.`
        : `Reminder: ${contactName} should return an item to you.`;

    const title = category === 'money' ? 'Payment Reminder! 💰' : 'Item Return Reminder! 📦';

    let trigger: any;

    if (frequency === 'none') {
        if (triggerDate < new Date()) return;
        trigger = triggerDate;
    } else if (frequency === 'daily') {
        trigger = {
            hour: 9,
            minute: 0,
            repeats: true,
        };
    } else if (frequency === 'weekly') {
        trigger = {
            weekday: triggerDate.getDay() + 1, // Expo uses 1-7 for Sunday-Saturday
            hour: 9,
            minute: 0,
            repeats: true,
        };
    } else if (frequency === 'monthly') {
        trigger = {
            day: triggerDate.getDate(),
            hour: 9,
            minute: 0,
            repeats: true,
        };
    } else if (frequency === 'yearly') {
        trigger = {
            month: triggerDate.getMonth() + 1,
            day: triggerDate.getDate(),
            hour: 9,
            minute: 0,
            repeats: true,
        };
    } else if (frequency === 'custom') {
        trigger = {
            seconds: interval * 24 * 60 * 60,
            repeats: true,
        };
    }

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: { loanId, kind: 'loan_reminder' },
        },
        trigger,
    });

    return identifier;
}

export async function scheduleLoanReminderForUser(
    userId: string,
    loanId: string,
    contactName: string,
    amount: number,
    dueDate: string,
    category: 'money' | 'item',
    frequency: string,
    interval: number
) {
    if (!userId) return null;
    const { data: prefs, error } = await getOrCreateUserPreferences(userId);
    if (error || !prefs) return null;

    if (!prefs.push_enabled || !prefs.reminder_enabled) return null;

    const permission = await getPushPermissionStatus();
    if (permission !== 'granted') return null;

    return scheduleLoanReminder(
        loanId,
        contactName,
        amount,
        dueDate,
        category,
        frequency,
        interval
    );
}

export async function upsertLoanReminderForUser(options: {
    userId: string;
    loanId: string;
    contactName: string;
    amount: number;
    dueDate: string;
    category: 'money' | 'item';
    status?: string | null;
    frequency?: string | null;
    interval?: number | null;
}) {
    await cancelLoanReminders(options.loanId);

    const frequency = options.frequency || 'none';
    if (options.status === 'paid' || frequency === 'none') return null;

    return scheduleLoanReminderForUser(
        options.userId,
        options.loanId,
        options.contactName,
        options.amount,
        options.dueDate,
        options.category,
        frequency,
        options.interval || 1
    );
}
