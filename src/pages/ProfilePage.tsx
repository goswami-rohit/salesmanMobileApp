// src/pages/ProfilePage.tsx 
// src/pages/ProfilePage.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, TouchableOpacity, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Chip, Portal, Modal, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabsParamList, AppStackParamList } from '../components/ReusableConstants';
import { useAppStore, fetchUserById } from '../components/ReusableConstants';
import LeaveApplicationForm from '../pages/forms/LeaveApplicationForm';

type ProfileScreenProps = BottomTabScreenProps<MainTabsParamList, 'Profile'>;

const StatTile = ({ iconName, value, label, color }: { iconName: string; value: number; label: string; color?: string }) => (
  <Card style={styles.statCard}>
    <Card.Content style={styles.statContent}>
      <Icon name={iconName} size={20} color={color || '#111'} />
      <View style={{ marginLeft: 12 }}>
        <Text variant="headlineSmall" style={styles.statValue}>{value}</Text>
        <Text variant="bodySmall" style={styles.statLabel}>{label}</Text>
      </View>
    </Card.Content>
  </Card>
);

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, reports, dealers, pjps, dailyTasks, dashboardStats, userTargets, setUser } = useAppStore();
  const [openLeave, setOpenLeave] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!user?.id) {
        try {
          const storedUserId = await AsyncStorage.getItem('userId');
          if (storedUserId) {
            const fetched = await fetchUserById(Number(storedUserId));
            if (fetched) setUser(fetched);
          }
        } catch (err) {
          console.error('Failed to fetch user', err);
        }
      }
    };
    loadUser();
  }, [user, setUser]);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.clear();
    setUser(null);
    const parentNav = navigation.getParent<NativeStackNavigationProp<AppStackParamList>>();
    parentNav?.navigate({ name: 'Login', params: { onLoginSuccess: () => {} } });
  }, [navigation, setUser]);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Avatar.Text size={96} label={initials} style={styles.avatar} />
          <Text variant="headlineMedium" style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text variant="bodyMedium" style={styles.email}>{user?.email}</Text>
          <Chip icon="account-tie" style={styles.chip}>{user?.role ?? 'User'}</Chip>
        </View>

        <View style={styles.statsRow}>
          <StatTile iconName="file-document-outline" value={(reports || []).length} label="Reports" color="#1e40af" />
          <StatTile iconName="storefront-outline" value={(dealers || []).length} label="Dealers" color="#f97316" />
        </View>
        <View style={styles.statsRow}>
          <StatTile iconName="map-marker-distance" value={(pjps || []).length} label="PJPs" color="#7c3aed" />
          <StatTile iconName="check-circle-outline" value={(dailyTasks || []).filter((t: any) => t.status === 'Completed').length} label="Tasks Done" color="#059669" />
        </View>

        <Card style={styles.card}>
          <Card.Title title="Performance Overview" left={(p) => <Icon {...p} name="trophy-award" size={20} color="#eab308" />} />
          <Card.Content>
            {dashboardStats?.attendance && (
              <View style={styles.attRow}>
                <View style={styles.attLeft}>
                  <Icon name="clock-outline" size={16} color="#2563eb" />
                  <Text variant="bodyMedium" style={{ marginLeft: 8 }}>Today's Attendance</Text>
                </View>
                <Chip style={dashboardStats.attendance.isPresent ? styles.presentChip : styles.absentChip}>
                  {dashboardStats.attendance.isPresent ? 'Present' : 'Absent'}
                </Chip>
              </View>
            )}

            {(userTargets || []).map((t: any, i: number) => {
              const progress = Math.min(100, Math.round(((t.current ?? 0) / (t.target || 1)) * 100));
              return (
                <View key={i} style={{ marginBottom: 12 }}>
                  <View style={styles.targetRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name={t.icon || 'target'} size={16} color={t.color || '#374151'} />
                      <Text style={{ marginLeft: 8 }}>{t.label}</Text>
                    </View>
                    <Text variant="bodySmall">{t.current} / {t.target}</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progress >= 80 ? '#059669' : progress >= 60 ? '#f59e0b' : '#ef4444' }]} />
                  </View>
                </View>
              );
            })}
          </Card.Content>
        </Card>

        <View style={{ marginVertical: 8 }}>
          <TouchableOpacity onPress={() => setOpenLeave(true)} style={styles.actionItem}>
            <Icon name="clipboard-list-outline" size={20} color="#374151" />
            <Text style={styles.actionText}>Apply for Leave</Text>
          </TouchableOpacity>

          <View style={styles.block}>
            <Text variant="titleSmall" style={{ marginBottom: 8 }}>Your Leave Applications</Text>
            <View style={styles.emptyBlock}>
              <Icon name="clipboard-list-outline" size={36} color="#cbd5e1" />
              <Text style={{ color: '#64748b' }}>No leave applications yet</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionItem}>
            <Icon name="package-variant-closed" size={20} color="#374151" />
            <Text style={styles.actionText}>Manage Brand Mapping</Text>
          </TouchableOpacity>

          <View style={styles.block}>
            <Text variant="titleSmall" style={{ marginBottom: 8 }}>Dealer-Brand Mapping</Text>
            <View style={styles.emptyBlock}>
              <Icon name="package-variant-closed" size={36} color="#cbd5e1" />
              <Text style={{ color: '#64748b' }}>No mappings yet</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Button mode="contained" onPress={handleLogout} buttonColor="#B91C1C" icon="logout">
            Logout
          </Button>
        </View>

      </ScrollView>

      <Portal>
        <Modal visible={openLeave} onDismiss={() => setOpenLeave(false)} contentContainerStyle={styles.modal}>
          <LeaveApplicationForm userId={user?.id} onSubmitted={() => setOpenLeave(false)} onCancel={() => setOpenLeave(false)} />
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingBottom: 32, paddingHorizontal: 16 },
  header: { alignItems: 'center', paddingVertical: 18 },
  avatar: { backgroundColor: '#1E40AF' },
  name: { marginTop: 12, fontWeight: '700' },
  email: { color: '#6B7280', marginTop: 6 },
  chip: { marginTop: 8, backgroundColor: '#DBEAFE' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statCard: { flex: 1, marginHorizontal: 6, elevation: 1 },
  statContent: { flexDirection: 'row', alignItems: 'center' },
  statValue: { fontWeight: '700' },
  statLabel: { color: '#6B7280' },
  card: { marginBottom: 12, elevation: 1 },
  attRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  attLeft: { flexDirection: 'row', alignItems: 'center' },
  presentChip: { backgroundColor: '#DCFCE7' },
  absentChip: { backgroundColor: '#F1F5F9' },
  targetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressBg: { height: 8, backgroundColor: '#E6E7EB', borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%' },
  actionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#fff', borderRadius: 10, marginVertical: 6, elevation: 1 },
  actionText: { marginLeft: 12 },
  block: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginVertical: 6, elevation: 1 },
  emptyBlock: { alignItems: 'center', paddingVertical: 14 },
  modal: { backgroundColor: 'white', margin: 20, borderRadius: 12, padding: 8 },
});
