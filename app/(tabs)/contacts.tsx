import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View as RNView, TextInput, useWindowDimensions } from 'react-native';
import { Text, View, Screen, Card } from '@/components/Themed';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { UserPlus, Search, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ContactsScreen() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const horizontalPadding = isTablet ? 28 : 20;
  const maxContentWidth = isTablet ? 760 : undefined;
  const bottomInset = Math.max(insets.bottom, 12);
  const fabBottomOffset = bottomInset + 16;
  const listBottomPadding = bottomInset + 88;

  useFocusEffect(
    React.useCallback(() => {
      fetchContacts();
    }, [user])
  );

  const fetchContacts = async () => {
    if (!user) return;

    // Fetch contacts
    const { data: contactsData } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (!contactsData || contactsData.length === 0) {
      setContacts([]);
      return;
    }

    // Fetch all active/partial loans for balance and items calculation
    const { data: loansData } = await supabase
      .from('loans')
      .select('id, amount, type, contact_id, category, status, item_name, due_date')
      .eq('user_id', user.id)
      .in('status', ['active', 'partial'])
      .is('deleted_at', null);

    // Fetch payments for those loans
    let paymentsData: any[] = [];
    if (loansData && loansData.length > 0) {
      const loanIds = loansData.map((l: any) => l.id);
      const { data: pData } = await supabase
        .from('payments')
        .select('amount, loan_id')
        .in('loan_id', loanIds);
      paymentsData = pData || [];
    }

    const contactsWithBalance = contactsData.map((contact: any) => {
      let balance = 0; // positive means they owe user, negative means user owes them
      let itemsOwed = 0;
      let activeLoansList: any[] = [];

      const contactLoans = loansData?.filter((l: any) => l.contact_id === contact.id) || [];

      contactLoans.forEach((loan: any) => {
        if (loan.category === 'money') {
          const loanPayments = paymentsData.filter((p: any) => p.loan_id === loan.id);
          const totalPaid = loanPayments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
          const remaining = Number(loan.amount) - totalPaid;

          if (loan.type === 'lent') {
            balance += remaining;
          } else if (loan.type === 'borrowed') {
            balance -= remaining;
          }
          activeLoansList.push({ ...loan, remaining });
        } else {
          // Object item
          if (loan.type === 'lent') {
            itemsOwed += 1;
          } else if (loan.type === 'borrowed') {
            itemsOwed -= 1;
          }
          activeLoansList.push(loan);
        }
      });

      return {
        ...contact,
        balance,
        itemsOwed,
        activeLoansList
      };
    });

    setContacts(contactsWithBalance);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phone && contact.phone.includes(searchQuery)) ||
    (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Screen style={styles.container}>
      <RNView style={[styles.searchWrapper, { paddingHorizontal: horizontalPadding, paddingTop: isTablet ? 24 : 20 }]}>
        <View style={[styles.searchContainer, maxContentWidth ? { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' } : null]}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            placeholder="Search contacts..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </RNView>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: listBottomPadding,
          }
        ]}
        ListEmptyComponent={
          <Card style={[styles.emptyCard, maxContentWidth ? { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' } : null]}>
            <Text style={styles.emptyText}>No contacts found.</Text>
          </Card>
        }
        renderItem={({ item }) => {
          const isExpanded = expandedContactId === item.id;
          const hasDebt = item.balance !== 0 || item.itemsOwed !== 0;

          return (
            <RNView
              style={[
                styles.contactItemWrapper,
                maxContentWidth ? { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' } : null
              ]}
            >
              <TouchableOpacity activeOpacity={0.8} onPress={() => router.push({ pathname: '/new-contact', params: { id: item.id } })}>
                <Card style={[styles.contactItem, isExpanded && { borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
                  <RNView style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                  </RNView>
                  <RNView style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactDetail}>{item.phone || item.email || 'No details'}</Text>
                  </RNView>

                  {hasDebt && (
                    <RNView style={{ alignItems: 'flex-end', justifyContent: 'center', marginRight: 12 }}>
                      {item.balance !== 0 && (
                        <RNView style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: item.balance > 0 ? '#10B981' : '#EF4444' }}>
                            {item.balance > 0 ? '+' : '-'}${Math.abs(item.balance).toLocaleString()}
                          </Text>
                          {item.itemsOwed === 0 && (
                            <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>
                              {item.balance > 0 ? 'Owes you' : 'You owe'}
                            </Text>
                          )}
                        </RNView>
                      )}

                      {item.itemsOwed !== 0 && (
                        <RNView style={{ alignItems: 'flex-end', marginTop: 2 }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: item.itemsOwed > 0 ? '#10B981' : '#EF4444' }}>
                            {Math.abs(item.itemsOwed)} item{Math.abs(item.itemsOwed) !== 1 ? 's' : ''}
                          </Text>
                          <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>
                            {item.itemsOwed > 0 ? 'Owes you' : 'You owe'}
                          </Text>
                        </RNView>
                      )}
                    </RNView>
                  )}

                  {item.activeLoansList?.length > 0 && (
                    <TouchableOpacity
                      style={{ padding: 8 }}
                      onPress={() => setExpandedContactId(isExpanded ? null : item.id)}
                    >
                      {isExpanded ? <ChevronUp size={20} color="#94A3B8" /> : <ChevronDown size={20} color="#94A3B8" />}
                    </TouchableOpacity>
                  )}
                </Card>
              </TouchableOpacity>

              {isExpanded && item.activeLoansList?.length > 0 && (
                <Card style={{ marginTop: -16, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16, paddingBottom: 16 }}>
                  {item.activeLoansList.map((loan: any, idx: number) => (
                    <RNView key={loan.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: idx === item.activeLoansList.length - 1 ? 0 : 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 16 }}>
                      <RNView style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600' }}>
                          {loan.category === 'money' ? 'Money' : loan.item_name}
                        </Text>
                        {loan.due_date && (
                          <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                            {loan.category === 'money' ? 'Due: ' : 'Expected: '}{loan.due_date.split('T')[0]}
                          </Text>
                        )}
                      </RNView>
                      <RNView style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                        {loan.category === 'money' ? (
                          <Text style={{ fontSize: 14, fontWeight: '700', color: loan.type === 'lent' ? '#10B981' : '#EF4444' }}>
                            ${loan.remaining?.toLocaleString()}
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 14, fontWeight: '700', color: loan.type === 'lent' ? '#10B981' : '#EF4444' }}>
                            Active
                          </Text>
                        )}
                        <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                          {loan.type === 'lent' ? 'Lent' : 'Borrowed'}
                        </Text>
                      </RNView>
                    </RNView>
                  ))}
                </Card>
              )}
            </RNView>
          );
        }}
        ListFooterComponent={<Text style={styles.copyright}>© 2026 I GOT YOU</Text>}
      />

      <TouchableOpacity
        style={[
          styles.fab,
          {
            right: horizontalPadding,
            bottom: fabBottomOffset,
          }
        ]}
        onPress={() => router.push('/new-contact')}
      >
        <UserPlus color="#fff" size={28} />
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  listContent: {
    paddingTop: 20,
  },
  contactItemWrapper: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  contactInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  contactDetail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
  },
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  copyright: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 12,
  },
});
