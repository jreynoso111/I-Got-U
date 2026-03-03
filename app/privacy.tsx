import React from 'react';
import { ScrollView, StyleSheet, View as RNView } from 'react-native';
import { Stack } from 'expo-router';
import { Screen, Text } from '@/components/Themed';

export default function PrivacyPolicyScreen() {
    return (
        <Screen style={styles.container}>
            <Stack.Screen options={{ title: 'Privacy Policy' }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.content}>
                    <Text style={styles.heading}>1. Information We Collect</Text>{'\n'}
                    We collect information that you manually provide, such as contact details, lend/borrow amounts, payment history, and account information needed to provide the service. We also collect automatically generated information, like log data and device information.{'\n\n'}

                    <Text style={styles.heading}>2. How We Use Information</Text>{'\n'}
                    We use the information we collect to operate and improve our App, maintain your account, process records of transactions securely, and occasionally contact you regarding important account updates.{'\n\n'}

                    <Text style={styles.heading}>3. Information Sharing</Text>{'\n'}
                    We do not sell, trade, or otherwise transfer your Personally Identifiable Information to outside parties. This does not include trusted third parties who assist us in operating our application, so long as those parties agree to keep this information confidential.{'\n\n'}

                    <Text style={styles.heading}>4. Data Security</Text>{'\n'}
                    We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet, or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.{'\n\n'}

                    <Text style={styles.heading}>5. Data Deletion</Text>{'\n'}
                    You can request account deletion and the removal of all associated data at any time by contacting our support team. Upon verification, your data will be permanently deleted from our servers.
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
