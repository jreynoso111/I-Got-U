import React from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowRight, BellRing, ShieldCheck, UsersRound, WalletCards, Zap } from 'lucide-react-native';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BrandLogo } from '@/components/BrandLogo';
import { AppLegalFooter } from '@/components/AppLegalFooter';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PublicCard, PublicSiteLayout } from '@/components/website/PublicSiteLayout';

const { width } = Dimensions.get('window');

export default function LandingPage() {
    const router = useRouter();

    if (Platform.OS === 'web') {
        return (
            <PublicSiteLayout
                eyebrow="Buddy Balance"
                title="Shared balance tracking for real relationships."
                description="Buddy Balance helps friends, families, and trusted contacts keep track of shared money, item loans, and payment history without losing context."
                actions={[
                    { href: '/help-support', label: 'Support & FAQ' },
                    { href: '/privacy', label: 'Read Privacy Policy', variant: 'secondary' },
                ]}
            >
                <View style={styles.webGrid}>
                    <PublicCard
                        title="Track what changed"
                        description="Keep a clean history of who lent what, what has already been paid back, and which records still need attention."
                    />
                    <PublicCard
                        title="Keep both sides informed"
                        description="Shared events, confirmations, and notifications make it easier for both people to understand the current state without rewriting history."
                    />
                    <PublicCard
                        title="Built for mobile release"
                        description="The mobile app is being prepared for store launch. This website hosts the public-facing policies, FAQ, and support information in the meantime."
                    />
                </View>

                <View style={styles.webHighlights}>
                    <View style={styles.webFeatureCard}>
                        <View style={styles.webFeatureIcon}>
                            <WalletCards size={22} color="#4F46E5" />
                        </View>
                        <View style={styles.webFeatureCopy}>
                            <Text style={styles.webFeatureTitle}>Money and item records</Text>
                            <Text style={styles.webFeatureText}>
                                Track cash loans, item returns, partial payments, and direction of ownership in one shared ledger.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.webFeatureCard}>
                        <View style={styles.webFeatureIcon}>
                            <BellRing size={22} color="#0EA5E9" />
                        </View>
                        <View style={styles.webFeatureCopy}>
                            <Text style={styles.webFeatureTitle}>Actionable notifications</Text>
                            <Text style={styles.webFeatureText}>
                                Approvals appear only where needed. Informational events still notify the other person without creating fake pending work.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.webFeatureCard}>
                        <View style={styles.webFeatureIcon}>
                            <UsersRound size={22} color="#16A34A" />
                        </View>
                        <View style={styles.webFeatureCopy}>
                            <Text style={styles.webFeatureTitle}>Contact-centered workflow</Text>
                            <Text style={styles.webFeatureText}>
                                Expand a contact to inspect history, edit details, and create a new shared record from the same place.
                            </Text>
                        </View>
                    </View>
                </View>
            </PublicSiteLayout>
        );
    }

    return (
        <AnimatedBackground style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <Animated.View
                        entering={FadeInUp.delay(300).duration(1000)}
                        style={styles.logoContainer}
                    >
                        <BrandLogo size="lg" showWordmark centered />
                        <Text style={styles.subtitle}>Hassle-free lending, for your loved ones.</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(600).duration(1000)}
                        style={styles.featuresContainer}
                    >
                        <FeatureItem
                            icon={<ShieldCheck size={22} color="#1D4ED8" />}
                            text="Secure & Reliable"
                        />
                        <FeatureItem
                            icon={<Zap size={22} color="#0284C7" />}
                            text="Real-time Management"
                        />
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(900).duration(1000)}
                        style={styles.ctaContainer}
                    >
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                pressed && { transform: [{ scale: 0.98 }] }
                            ]}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                            <ArrowRight size={20} color="#FFFFFF" strokeWidth={3} />
                        </Pressable>
                    </Animated.View>
                </View>

                <View style={styles.footer}>
                    <AppLegalFooter style={styles.footerText} />
                </View>
            </SafeAreaView>
        </AnimatedBackground>
    );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <LinearGradient
            colors={['rgba(255,255,255,0.84)', 'rgba(255,255,255,0.50)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featureItem}
        >
            <View style={styles.featureIconWrap}>
                {icon}
            </View>
            <Text style={styles.featureText}>{text}</Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    subtitle: {
        fontSize: 18,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
        marginTop: 12,
    },
    featuresContainer: {
        width: '100%',
        marginBottom: 60,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.56)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.82)',
        shadowColor: '#334155',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 6,
    },
    featureIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderWidth: 1,
        borderColor: 'rgba(226,232,240,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 12,
    },
    ctaContainer: {
        width: '100%',
    },
    button: {
        backgroundColor: '#6366F1',
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    footer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    footerText: {
        color: '#475569',
        fontSize: 12,
    },
    webGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    webHighlights: {
        gap: 16,
    },
    webFeatureCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        padding: 22,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    webFeatureIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    webFeatureCopy: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    webFeatureTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 6,
    },
    webFeatureText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#475569',
    },
});
