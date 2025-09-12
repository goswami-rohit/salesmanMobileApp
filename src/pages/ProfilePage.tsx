// src/pages/ProfilePage.tsx
import React, { useCallback, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  StyleSheet,
  Alert,
} from 'react-native';
import { Avatar, Button, Text, useTheme, Portal, Modal, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ComponentProps } from 'react';

import type { MainTabsParamList, AppStackParamList } from '../components/ReusableConstants';
import { useAppStore, fetchUserById } from '../components/ReusableConstants';
import LeaveApplicationForm from '../pages/forms/LeaveApplicationForm';
import AppHeader from '../components/AppHeader';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type ProfileScreenProps = BottomTabScreenProps<MainTabsParamList, 'Profile'>;

// --- Avatar Component ---
const UserAvatar: React.FC<{ initials: string; theme: any }> = ({ initials, theme }) => {
  return (
    <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
      <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>{initials}</Text>
    </View>
  );
};

// --- Stat Tile Component ---
const StatTile: React.FC<{
  iconName: IconName;
  value: number;
  label: string;
  color: string;
  theme: any;
}> = ({ iconName, value, label, color, theme }) => {
  return (
    <View style={[styles.statTileContainer, { borderColor: theme.colors.outlineVariant }]}>
      <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <View style={[styles.statIconContainer, { backgroundColor: color }]}>
          <MaterialCommunityIcons name={iconName} size={20} color={theme.colors.onPrimary} />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{value}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        </View>
      </Card>
    </View>
  );
};

// --- Progress Bar Component ---
const ProgressBar: React.FC<{
  progress: number;
  color: string;
  theme: any;
}> = ({ progress, color, theme }) => {
  return (
    <View style={[styles.progressContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${progress}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
};

// --- Action Button Component ---
const ActionButton: React.FC<{
  icon: IconName;
  title: string;
  onPress: () => void;
  color: string;
  theme: any;
}> = ({ icon, title, onPress, color, theme }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.actionButtonContainer, { borderColor: theme.colors.outline }]} activeOpacity={0.7}>
      <View style={[styles.actionButtonContent, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
          <MaterialCommunityIcons name={icon} size={20} color={theme.colors.onPrimary} />
        </View>
        <Text style={[styles.actionButtonText, { color: theme.colors.onSurface }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Main Component ---
export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const theme = useTheme();
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
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            setUser(null);
            const parentNav = navigation.getParent<NativeStackNavigationProp<AppStackParamList>>();
            parentNav?.navigate({ name: 'Login', params: { onLoginSuccess: () => { } } });
          }
        },
      ]
    );
  }, [navigation, setUser]);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const statsData: {
    iconName: IconName;
    value: number;
    label: string;
    color: string;
  }[] = [
      { iconName: 'file-document-outline', value: (reports || []).length, label: 'Reports', color: theme.colors.primary },
      { iconName: 'storefront-outline', value: (dealers || []).length, label: 'Dealers', color: '#10b981' },
      { iconName: 'map-marker-distance', value: (pjps || []).length, label: 'PJPs', color: '#f59e0b' },
      { iconName: 'check-circle-outline', value: (dailyTasks || []).filter((t: any) => t.status === 'Completed').length, label: 'Tasks Done', color: '#a855f7' },
    ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <RNStatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <AppHeader title="Profile Page" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <View style={styles.header}>
            <UserAvatar initials={initials} theme={theme} />
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>{user?.email}</Text>
            <View style={[styles.roleChip, { backgroundColor: theme.colors.primaryContainer }]}>
              <MaterialCommunityIcons name="account-tie" size={16} color={theme.colors.onPrimaryContainer} />
              <Text style={[styles.roleText, { color: theme.colors.onPrimaryContainer }]}>{user?.role ?? 'Agent'}</Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map((stat) => (
            <StatTile
              key={stat.label}
              iconName={stat.iconName}
              value={stat.value}
              label={stat.label}
              color={stat.color}
              theme={theme}
            />
          ))}
        </View>

        {/* Performance Card */}
        <Card style={[styles.performanceCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <View style={styles.performanceHeader}>
            <View style={[styles.performanceIconContainer, { backgroundColor: theme.colors.secondary }]}>
              <MaterialCommunityIcons name="trophy-award" size={20} color={theme.colors.onSecondary} />
            </View>
            <Text style={[styles.performanceTitle, { color: theme.colors.onSurface }]}>PERFORMANCE</Text>
          </View>
          {dashboardStats?.attendance && (
            <View style={styles.attendanceRow}>
              <View style={styles.attendanceLeft}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.attendanceLabel, { color: theme.colors.onSurface }]}>Attendance</Text>
              </View>
              <View style={[styles.attendanceChip, { backgroundColor: dashboardStats.attendance.isPresent ? theme.colors.secondaryContainer : theme.colors.errorContainer }]}>
                <Text style={[styles.attendanceChipText, { color: dashboardStats.attendance.isPresent ? theme.colors.onSecondaryContainer : theme.colors.onErrorContainer }]}>
                  {dashboardStats.attendance.isPresent ? 'ACTIVE' : 'OFFLINE'}
                </Text>
              </View>
            </View>
          )}
          {(userTargets || []).map((target: any, index: number) => {
            const progress = Math.min(100, Math.round(((target.current ?? 0) / (target.target || 1)) * 100));
            const progressColor = progress >= 80 ? '#10b981' : progress >= 60 ? '#f59e0b' : '#ef4444';
            return (
              <View key={index} style={styles.targetContainer}>
                <View style={styles.targetRow}>
                  <View style={styles.targetLeft}>
                    <MaterialCommunityIcons name={target.icon || 'target'} size={16} color={theme.colors.onSurfaceVariant} />
                    <Text style={[styles.targetLabel, { color: theme.colors.onSurface }]}>{target.label}</Text>
                  </View>
                  <Text style={[styles.targetValue, { color: theme.colors.onSurfaceVariant }]}>
                    {target.current} / {target.target}
                  </Text>
                </View>
                <ProgressBar progress={progress} color={progressColor} theme={theme} />
              </View>
            );
          })}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <ActionButton
            icon="clipboard-list-outline"
            title="Apply for Leave"
            onPress={() => setOpenLeave(true)}
            color={theme.colors.primary}
            theme={theme}
          />
          <ActionButton
            icon="package-variant-closed"
            title="Brand Mapping"
            onPress={() => console.log('Brand mapping')}
            color='#10b981'
            theme={theme}
          />
        </View>

        {/* Empty States */}
        <View style={styles.emptyStatesContainer}>
          <Card style={[styles.emptyStateCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={2}>
            <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>Leave Applications</Text>
            <View style={styles.emptyStateContent}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={36} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>No leave applications in neural database</Text>
            </View>
          </Card>
          <Card style={[styles.emptyStateCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={2}>
            <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>Dealer-Brand Mapping</Text>
            <View style={styles.emptyStateContent}>
              <MaterialCommunityIcons name="package-variant-closed" size={36} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>No neural mappings configured</Text>
            </View>
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            icon="power"
          >
            LOG OUT
          </Button>
        </View>
      </ScrollView>

      {/* Modal */}
      <Portal>
        <Modal
          visible={openLeave}
          onDismiss={() => setOpenLeave(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
        >
          <LeaveApplicationForm
            userId={user?.id}
            onSubmitted={() => setOpenLeave(false)}
            onCancel={() => setOpenLeave(false)}
          />
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  headerCard: {
    marginVertical: 16,
    borderRadius: 16,
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statTileContainer: {
    width: '48%',
    marginBottom: 12,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  performanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  performanceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  attendanceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attendanceChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  targetContainer: {
    marginBottom: 16,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  targetValue: {
    fontSize: 12,
  },
  progressContainer: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionButtonContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyStatesContainer: {
    gap: 12,
    marginBottom: 20,
  },
  emptyStateCard: {
    borderRadius: 12,
    padding: 16,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  logoutContainer: {
    marginTop: 12,
  },
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  modal: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 8,
  },
});