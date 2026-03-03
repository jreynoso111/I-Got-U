import React from 'react';
import { ScrollView, StyleSheet, View as RNView } from 'react-native';
import { Stack } from 'expo-router';
import { Screen, Text } from '@/components/Themed';

export default function FAQScreen() {
    return (
        <Screen style={styles.container}>
            <Stack.Screen options={{ title: 'Frequently Asked Questions' }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.content}>
                    <Text style={styles.heading}>How do I create a new lend/borrow entry?</Text>{'\n'}
                    First, make sure you have added a contact in the "Contacts" tab. Then, go to the Home tab, tap on the "+" button, select the contact, choose whether it's a Money or Item entry, and fill in the details.{'\n\n'}

                    <Text style={styles.heading}>Can I track borrowed or lent items?</Text>{'\n'}
                    Yes! During the entry creation process, change the entry type from "Current Money" to "Objects". You can then specify the name of the item instead of an amount.{'\n\n'}

                    <Text style={styles.heading}>How do I register a partial payment?</Text>{'\n'}
                    Navigate to the specific record details page, and tap the "Register Payment" button. You can enter the exact amount paid. The app will automatically update the remaining balance of the record.{'\n\n'}

                    <Text style={styles.heading}>Does the app actually move real money?</Text>{'\n'}
                    No. "I GOT YOU" is strictly a ledger tool designed to help you organize and remember who owes what. All actual payments must be done outside the app (e.g., cash, bank transfer) and recorded manually in the app.{'\n\n'}

                    <Text style={styles.heading}>Can I export my data?</Text>{'\n'}
                    Yes, you can export your data in CSV format from the Settings tab under the "Data Exporter" section. You can export lend/borrow records, payments, and contacts.
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
