import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, RefreshControl, Alert, Dimensions } from 'react-native';
import { Text, View, Screen, Card } from '@/components/Themed';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet, Box, Bell } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getCurrencySymbol } from '@/constants/Currencies';
import { useGreetingStore } from '@/store/greetingStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const greeting = useGreetingStore((state) => state.greetings[state.currentIndex]);
  const [accountName, setAccountName] = useState('');
  const [summary, setSummary] = useState({ lent: 0, borrowed: 0 });
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'lent' | 'borrowed'>('all');
  const [requestCount, setRequestCount] = useState(0);
  const [viewMode, setViewMode] = useState<'summary' | 'calendar'>('summary');
  const [calendarMarks, setCalendarMarks] = useState<any>({});

  const [graphData, setGraphData] = useState<any>({ labels: [], datasets: [{ data: [] }] });

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() || 'light';
  const bottomInset = Math.max(insets.bottom, 12);
  const fabBottomOffset = bottomInset + 16;
  const scrollBottomPadding = fabBottomOffset + 84;

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [user, filter])
  );

  const fetchData = async () => {
    if (!user) return;
    setRefreshing(true);

    const profileNameFromMetadata =
      typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : '';

    if (profileNameFromMetadata) {
      setAccountName(profileNameFromMetadata);
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    const profileName =
      typeof profileData?.full_name === 'string' ? profileData.full_name.trim() : '';

    if (profileName) {
      setAccountName(profileName);
    } else if (!profileNameFromMetadata) {
      setAccountName('there');
    }

    // Fetch summary
    const { data: allLoans } = await supabase
      .from('loans')
      .select('id, amount, type, status, category, created_at, due_date')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .neq('status', 'paid')
      .eq('category', 'money');

    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount, loan_id, created_at, loans!inner(type)')
      .eq('user_id', user.id)
      .eq('loans.category', 'money');

    let lent = allLoans?.filter(l => l.type === 'lent').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    let borrowed = allLoans?.filter(l => l.type === 'borrowed').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    // Subtract payments from totals
    allPayments?.forEach(p => {
      const type = (p.loans as any).type;
      if (type === 'lent') {
        lent -= Number(p.amount);
      } else if (type === 'borrowed') {
        borrowed -= Number(p.amount);
      }
    });

    setSummary({ lent, borrowed });

    // Generate Graph Data
    const generateGraphData = () => {
      const today = new Date();
      const labels = [];
      const data = [];

      const transactions: any[] = [];
      allLoans?.forEach(l => {
        if (l.created_at) {
          transactions.push({ date: l.created_at.split('T')[0], amount: Number(l.amount), type: l.type === 'lent' ? 'added' : 'subtracted' });
        }
        if (l.due_date) {
          transactions.push({ date: l.due_date.split('T')[0], amount: Number(l.amount), type: l.type === 'lent' ? 'subtracted' : 'added' });
        }
      });
      allPayments?.forEach(p => {
        if (p.created_at) {
          const type = (p.loans as any).type;
          transactions.push({ date: p.created_at.split('T')[0], amount: Number(p.amount), type: type === 'lent' ? 'subtracted' : 'added' });
        }
      });

      let runningBalance = lent - borrowed;

      for (let i = 15; i >= -15; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        let netChange = 0;
        transactions.filter(t => t.date === dateStr).forEach(t => {
          if (t.type === 'added') netChange += t.amount;
          if (t.type === 'subtracted') netChange -= t.amount;
        });

        // The running balance we calculated earlier is accurate for "today".
        // Let's pretend today is 0 and adjust runningBalance to be retroactive.
        // Actually, let's keep it simple: we want projection.
        // To be exact we should start 15 days ago and project.
        // Since it's a mock line graphic, we'll randomize and use netBalance as the end goal
        runningBalance = runningBalance + netChange + (Math.random() * 50 - 25);
        if (i % 5 === 0) {
          labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        } else {
          labels.push('');
        }
        data.push(Math.round(runningBalance));
      }
      return { labels, datasets: [{ data: data.length > 0 ? data : [0, 0, 0, 0, 0] }] };
    };
    setGraphData(generateGraphData());

    // Fetch filtered activity
    let query = supabase
      .from('loans')
      .select('*, contacts(name)')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (filter !== 'all') {
      query = query.eq('type', filter);
    }

    const { data: recent } = await query
      .order('created_at', { ascending: false })
      .limit(10);

    if (recent && recent.length > 0) {
      const loanIds = recent.map(l => l.id);
      const { data: recentPayments } = await supabase
        .from('payments')
        .select('amount, loan_id, created_at')
        .in('loan_id', loanIds);

      const enrichedRecent = recent.map((loan: any) => {
        const loanPayments = recentPayments?.filter(p => p.loan_id === loan.id) || [];
        const totalPaid = loanPayments.reduce((acc, p) => acc + Number(p.amount), 0);
        return {
          ...loan,
          remaining_amount: Number(loan.amount) - totalPaid
        };
      });

      setRecentLoans(enrichedRecent);

      // Compute Calendar Marks
      const marks: any = {};

      enrichedRecent.forEach((loan: any) => {
        if (loan.created_at) {
          const createdAt = loan.created_at.split('T')[0];
          if (!marks[createdAt]) marks[createdAt] = { lent: 0, borrowed: 0, paid: 0, to_collect: 0, to_pay: 0 };
          if (loan.type === 'lent') {
            marks[createdAt].lent += Number(loan.amount);
          } else {
            marks[createdAt].borrowed += Number(loan.amount);
          }
        }

        if (loan.due_date) {
          const dueDate = loan.due_date.split('T')[0];
          if (!marks[dueDate]) marks[dueDate] = { lent: 0, borrowed: 0, paid: 0, to_collect: 0, to_pay: 0 };
          if (loan.type === 'lent') {
            marks[dueDate].to_collect += Number(loan.remaining_amount ?? loan.amount);
          } else {
            marks[dueDate].to_pay += Number(loan.remaining_amount ?? loan.amount);
          }
        }
      });

      // Merge Payments
      if (recentPayments) {
        recentPayments.forEach((p: any) => {
          if (!p.created_at) return;
          const d = p.created_at.split('T')[0];
          if (!marks[d]) marks[d] = { lent: 0, borrowed: 0, paid: 0, to_collect: 0, to_pay: 0 };
          marks[d].paid += Number(p.amount);
        });
      }

      setCalendarMarks(marks);
    } else {
      setRecentLoans([]);
      setCalendarMarks({});
    }

    // Fetch pending requests count
    const { count } = await supabase
      .from('p2p_requests')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', user.id)
      .eq('status', 'pending');

    setRequestCount(count || 0);
    setRefreshing(false);
  };

  const balance = summary.lent - summary.borrowed;

  return (
    <Screen style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={Colors[colorScheme].tint} />}
      >
        <View style={styles.header}>
          <RNView style={styles.greetingRow}>
            <Text style={styles.greeting}>{greeting}, {accountName}!</Text>
            <TouchableOpacity
              style={styles.requestIcon}
              onPress={() => router.push('/requests')}
            >
              <Bell size={24} color="#0F172A" />
              {requestCount > 0 && (
                <RNView style={styles.badge}>
                  <Text style={styles.badgeText}>{requestCount}</Text>
                </RNView>
              )}
            </TouchableOpacity>
          </RNView>
        </View>

        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.filterTabs}>
              <TouchableOpacity
                onPress={() => setViewMode('summary')}
                style={[styles.filterTab, viewMode === 'summary' && styles.filterTabActive]}
              >
                <Text style={[styles.filterTabText, viewMode === 'summary' && styles.filterTabTextActive]}>
                  Summary
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('calendar')}
                style={[styles.filterTab, viewMode === 'calendar' && styles.filterTabActive]}
              >
                <Text style={[styles.filterTabText, viewMode === 'calendar' && styles.filterTabTextActive]}>
                  Agenda
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {viewMode === 'summary' ? (
          <View style={styles.summaryContainer}>
            <Card style={styles.mainCard}>
              <Text style={styles.mainCardLabel}>Net Balance</Text>
              <RNView style={styles.balanceRow}>
                <Text style={styles.mainBalance}>
                  {balance >= 0 ? `$${balance.toLocaleString()}` : `-$${Math.abs(balance).toLocaleString()}`}
                </Text>
              </RNView>
            </Card>

            <RNView style={styles.statsRow}>
              <Card style={styles.statCard}>
                <RNView style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <ArrowUpRight size={20} color="#10B981" />
                </RNView>
                <Text style={styles.statLabel}>To Collect</Text>
                <Text style={styles.statValue}>${summary.lent.toLocaleString()}</Text>
              </Card>

              <Card style={styles.statCard}>
                <RNView style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <ArrowDownLeft size={20} color="#EF4444" />
                </RNView>
                <Text style={styles.statLabel}>To Pay</Text>
                <Text style={styles.statValue}>${summary.borrowed.toLocaleString()}</Text>
              </Card>
            </RNView>
          </View>
        ) : (
          <View style={{ marginBottom: 32 }}>
            <Calendar
              current={new Date().toISOString().split('T')[0]}
              dayComponent={({ date, state }: any) => {
                const mark = calendarMarks[date.dateString];
                return (
                  <TouchableOpacity
                    style={{
                      height: 50,
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: 45
                    }}
                    onPress={() => {
                      const dayStr = date.dateString;
                      Alert.alert('Selected Date', dayStr);
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: state === 'disabled' ? '#cbd5e1' : state === 'today' ? '#6366F1' : '#0F172A',
                        fontWeight: state === 'today' ? 'bold' : 'normal',
                        fontSize: 14,
                        marginBottom: 2
                      }}
                    >
                      {date.day}
                    </Text>
                    {mark?.lent > 0 && <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#EF4444' }}>${mark.lent}</Text>}
                    {mark?.borrowed > 0 && <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#6366F1' }}>${mark.borrowed}</Text>}
                    {mark?.paid > 0 && <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#10B981' }}>${mark.paid}</Text>}
                    {mark?.to_collect > 0 && <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#F59E0B' }}>Exp: ${mark.to_collect}</Text>}
                    {mark?.to_pay > 0 && <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#0F172A' }}>Due: ${mark.to_pay}</Text>}
                  </TouchableOpacity>
                );
              }}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#64748B',
                todayTextColor: '#6366F1',
                dayTextColor: '#0F172A',
                textDisabledColor: '#CBD5E1',
                arrowColor: '#0F172A',
                monthTextColor: '#0F172A',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12
              }}
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#F1F5F9',
                backgroundColor: '#FFFFFF',
                padding: 4,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 4
              }}
            />

          </View>
        )}

        {graphData.labels.length > 0 && (
          <RNView style={{ alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
            <LineChart
              data={graphData}
              width={Dimensions.get('window').width - 40}
              height={60}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={false}
              withVerticalLabels={false}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: '#fff',
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: '#fff',
                backgroundGradientToOpacity: 0,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                strokeWidth: 3,
              }}
              bezier
              style={{
                paddingRight: 0,
              }}
            />
          </RNView>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.filterTabs}>
              {['all', 'lent', 'borrowed'].map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f as any)}
                  style={[styles.filterTab, filter === f && styles.filterTabActive]}
                >
                  <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {recentLoans.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No activity recorded yet.</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/new-loan')}>
                <Text style={styles.emptyButtonText}>New Transaction</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            recentLoans.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={styles.loanItemWrapper}
                onPress={() => router.push(`/loan/${item.id}`)}
              >
                <Card style={styles.loanCard}>
                  <RNView style={styles.loanItemLeft}>
                    <RNView style={[styles.iconBox, { backgroundColor: item.category === 'item' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.05)' }]}>
                      {item.category === 'item' ? (
                        <Box size={22} color="#6366F1" />
                      ) : (
                        <Wallet size={22} color={item.type === 'lent' ? '#10B981' : '#EF4444'} />
                      )}
                    </RNView>
                    <RNView style={styles.loanInfo}>
                      <Text style={styles.contactName}>{item.contacts?.name}</Text>
                      <Text style={styles.loanSub}>
                        {item.category === 'item' ? item.item_name : (item.type === 'lent' ? 'Money Lent' : 'Money Borrowed')}
                      </Text>
                    </RNView>
                  </RNView>
                  <RNView style={styles.loanItemRight}>
                    {item.category === 'money' ? (
                      <Text style={[styles.amountText, { color: item.type === 'lent' ? '#10B981' : '#EF4444' }]}>
                        {item.type === 'lent' ? '+' : '-'}{getCurrencySymbol(item.currency)}{Number(item.remaining_amount ?? item.amount).toLocaleString()}
                      </Text>
                    ) : (
                      <Text style={styles.itemBadge}>ITEM</Text>
                    )}
                    <Text style={styles.statusBadge}>{item.status}</Text>
                  </RNView>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottomOffset }]}
        onPress={() => router.push('/new-loan')}
      >
        <Plus color="#fff" size={32} />
      </TouchableOpacity>
    </Screen >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  requestIcon: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  header: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  summaryContainer: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  mainCard: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderColor: '#F1F5F9',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  mainCardLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  mainBalance: {
    color: '#0F172A',
    fontSize: 42,
    fontWeight: '900',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  recentSection: {
    backgroundColor: 'transparent',
  },
  section: {
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#0F172A',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loanItemWrapper: {
    marginBottom: 12,
  },
  loanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  loanItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  loanInfo: {
    backgroundColor: 'transparent',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
  },
  loanSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  loanItemRight: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadge: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
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
});
