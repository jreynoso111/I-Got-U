import React from 'react';
import { ScrollView, StyleSheet, View as RNView } from 'react-native';
import { Stack } from 'expo-router';
import { Screen, Text } from '@/components/Themed';

export default function TermsOfServiceScreen() {
    return (
        <Screen style={styles.container}>
            <Stack.Screen options={{ title: 'Terms of Service' }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.content}>
                    <Text style={styles.heading}>1. Acceptance of Terms</Text>{'\n'}
                    By accessing or using the "I GOT YOU" app ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.{'\n\n'}

                    <Text style={styles.heading}>2. Description of Service</Text>{'\n'}
                    The Service is a lending/borrowing and payment tracking application that allows users to record and manage personal or business debts, both in money and items. The Service strictly provides a tracking mechanism and does not facilitate actual transfer of funds or items.{'\n\n'}

                    <Text style={styles.heading}>3. User Responsibilities</Text>{'\n'}
                    You are responsible for the accuracy of all information you input into the Service. You agree that the app is merely a ledger and you solely bear the responsibility for any agreements, collections, or legal actions outside the Service.{'\n\n'}

                    <Text style={styles.heading}>4. Prohibited Uses</Text>{'\n'}
                    You agree not to use the Service for any unlawful purpose, to solicit others to perform or participate in any unlawful acts, or to violate any international, federal, or state regulations, rules, laws, or local ordinances. The Service may not be used for tracking illicit transactions.{'\n\n'}

                    <Text style={styles.heading}>5. Changes to Terms</Text>{'\n'}
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </Text>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 120,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    content: {
        fontSize: 14,
        lineHeight: 24,
        color: '#334155',
    },
});
