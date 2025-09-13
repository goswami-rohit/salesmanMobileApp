// src/pages/ProfilePage.tsx
import React, { useCallback, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  StatusBar as RNStatusBar,
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
import LiquidGlassCard from '../components/LiquidGlassCard';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type ProfileScreenProps = BottomTabScreenProps<MainTabsParamList, 'Profile'>;

// --- LIQUID GLASS Avatar Component ---
const UserAvatar: React.FC<{ initials: string; theme: any }> = ({ initials, theme }) => {
  return (
    <View 
      className="w-24 h-24 rounded-full items-center justify-center mb-4"
      style={{ backgroundColor: theme.colors.primary }}
    >
      <Text className="text-3xl font-bold" style={{ color: theme.colors.onPrimary }}>
        {initials}
      </Text>
    </View>
  );
};

// --- LIQUID GLASS Stat Tile Component ---
const StatTile: React.FC<{
  iconName: IconName;
  value: number;
  label: string;
  color: string;
  theme: any;
}> = ({ iconName, value, label, color, theme }) => {
  return (
    <LiquidGlassCard className="w-[48%] mb-3 shadow-lg" intensity={12}>
      <View className="flex-row items-center">
        <View 
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: color }}
        >
          <MaterialCommunityIcons name={iconName} size={20} color={theme.colors.onPrimary} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold" style={{ color: theme.colors.onSurface }}>
            {value}
          </Text>
          <Text className="text-xs mt-1" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>
        </View>
      </View>
    </LiquidGlassCard>
  );
};

// --- LIQUID GLASS Progress Bar Component ---
const ProgressBar: React.FC<{
  progress: number;
  color: string;
  theme: any;
}> = ({ progress, color, theme }) => {
  return (
    <View 
      className="h-2 rounded-lg overflow-hidden"
      style={{ backgroundColor: theme.colors.surfaceVariant }}
    >
      <View
        className="h-full rounded-lg"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </View>
  );
};

// --- LIQUID GLASS Action Button Component ---
const ActionButton: React.FC<{
  icon: IconName;
  title: string;
  onPress: () => void;
  color: string;
  theme: any;
}> = ({ icon, title, onPress, color, theme }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-1">
      <LiquidGlassCard className="shadow-lg" intensity={14}>
        <View className="flex-row items-center gap-3">
          <View 
            className="w-8 h-8 rounded-2xl items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <MaterialCommunityIcons name={icon} size={20} color={theme.colors.onPrimary} />
          </View>
          <Text className="text-xs font-bold" style={{ color: theme.colors.onSurface }}>
            {title}
          </Text>
        </View>
      </LiquidGlassCard>
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <RNStatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <AppHeader title="Profile Page" />
      
      <ScrollView 
        className="pb-8 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header - LIQUID GLASS */}
        <LiquidGlassCard className="my-4 shadow-2xl" intensity={20}>
          <View className="items-center">
            <UserAvatar initials={initials} theme={theme} />
            <Text className="text-2xl font-bold mb-1" style={{ color: theme.colors.onSurface }}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-sm mb-3" style={{ color: theme.colors.onSurfaceVariant }}>
              {user?.email}
            </Text>
            <View 
              className="flex-row items-center px-4 py-2 rounded-2xl gap-2 mb-3"
              style={{ backgroundColor: theme.colors.primaryContainer }}
            >
              <MaterialCommunityIcons name="account-tie" size={16} color={theme.colors.onPrimaryContainer} />
              <Text 
                className="text-xs font-semibold"
                style={{ 
                  color: theme.colors.onPrimaryContainer,
                  letterSpacing: 0.5 
                }}
              >
                {user?.role ?? 'Agent'}
              </Text>
            </View>
          </View>
        </LiquidGlassCard>

        {/* Stats Grid - LIQUID GLASS */}
        <View className="flex-row flex-wrap justify-between mb-5">
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

        {/* Performance Card - LIQUID GLASS */}
        <LiquidGlassCard className="mb-5 shadow-xl" intensity={18}>
          <View>
            <View className="flex-row items-center mb-5">
              <View 
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: theme.colors.secondary }}
              >
                <MaterialCommunityIcons name="trophy-award" size={20} color={theme.colors.onSecondary} />
              </View>
              <Text 
                className="text-base font-bold"
                style={{ 
                  color: theme.colors.onSurface,
                  letterSpacing: 1 
                }}
              >
                PERFORMANCE
              </Text>
            </View>

            {dashboardStats?.attendance && (
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
                  <Text className="text-sm ml-2" style={{ color: theme.colors.onSurface }}>
                    Attendance
                  </Text>
                </View>
                <View 
                  className="px-3 py-1 rounded-xl"
                  style={{ 
                    backgroundColor: dashboardStats.attendance.isPresent 
                      ? theme.colors.secondaryContainer 
                      : theme.colors.errorContainer 
                  }}
                >
                  <Text 
                    className="text-xs font-bold"
                    style={{ 
                      color: dashboardStats.attendance.isPresent 
                        ? theme.colors.onSecondaryContainer 
                        : theme.colors.onErrorContainer,
                      letterSpacing: 0.5 
                    }}
                  >
                    {dashboardStats.attendance.isPresent ? 'ACTIVE' : 'OFFLINE'}
                  </Text>
                </View>
              </View>
            )}

            {(userTargets || []).map((target: any, index: number) => {
              const progress = Math.min(100, Math.round(((target.current ?? 0) / (target.target || 1)) * 100));
              const progressColor = progress >= 80 ? '#10b981' : progress >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <View key={index} className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name={target.icon || 'target'} size={16} color={theme.colors.onSurfaceVariant} />
                      <Text className="text-sm ml-2" style={{ color: theme.colors.onSurface }}>
                        {target.label}
                      </Text>
                    </View>
                    <Text className="text-xs" style={{ color: theme.colors.onSurfaceVariant }}>
                      {target.current} / {target.target}
                    </Text>
                  </View>
                  <ProgressBar progress={progress} color={progressColor} theme={theme} />
                </View>
              );
            })}
          </View>
        </LiquidGlassCard>

        {/* Action Buttons - LIQUID GLASS */}
        <View className="flex-row justify-between gap-3 mb-5">
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

        {/* Empty States - LIQUID GLASS */}
        <View className="gap-3 mb-5">
          <LiquidGlassCard className="shadow-lg" intensity={14}>
            <View>
              <Text className="text-sm font-semibold mb-3" style={{ color: theme.colors.onSurface }}>
                Leave Applications
              </Text>
              <View className="items-center py-5">
                <MaterialCommunityIcons name="clipboard-list-outline" size={36} color={theme.colors.onSurfaceVariant} />
                <Text className="text-xs text-center mt-2" style={{ color: theme.colors.onSurfaceVariant }}>
                  No leave applications in neural database
                </Text>
              </View>
            </View>
          </LiquidGlassCard>

          <LiquidGlassCard className="shadow-lg" intensity={14}>
            <View>
              <Text className="text-sm font-semibold mb-3" style={{ color: theme.colors.onSurface }}>
                Dealer-Brand Mapping
              </Text>
              <View className="items-center py-5">
                <MaterialCommunityIcons name="package-variant-closed" size={36} color={theme.colors.onSurfaceVariant} />
                <Text className="text-xs text-center mt-2" style={{ color: theme.colors.onSurfaceVariant }}>
                  No neural mappings configured
                </Text>
              </View>
            </View>
          </LiquidGlassCard>
        </View>

        {/* Logout Button - LIQUID GLASS */}
        <LiquidGlassCard className="shadow-xl" intensity={16}>
          <Button
            mode="contained"
            onPress={handleLogout}
            className="py-1 rounded-xl"
            style={{ backgroundColor: theme.colors.error }}
            icon="power"
          >
            LOG OUT
          </Button>
        </LiquidGlassCard>
      </ScrollView>

      {/* Modal - LIQUID GLASS */}
      <Portal>
        <Modal
          visible={openLeave}
          onDismiss={() => setOpenLeave(false)}
          contentContainerStyle={{
            marginHorizontal: 20,
            borderRadius: 16,
            padding: 8,
            backgroundColor: 'transparent'
          }}
        >
          <LiquidGlassCard className="flex-1" intensity={25}>
            <LeaveApplicationForm
              userId={user?.id}
              onSubmitted={() => setOpenLeave(false)}
              onCancel={() => setOpenLeave(false)}
            />
          </LiquidGlassCard>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}