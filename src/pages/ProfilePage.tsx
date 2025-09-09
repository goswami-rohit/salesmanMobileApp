// src/pages/ProfilePage.tsx 
import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, View, TouchableOpacity, StatusBar as RNStatusBar } from 'react-native';
import { Avatar, Button, Card, Chip, Modal, Portal, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabsParamList, AppStackParamList } from '../components/ReusableConstants';

import { useAppStore } from '../components/ReusableConstants';
import LeaveApplicationForm from '../pages/forms/LeaveApplicationForm';

// FIX: Define a type for the navigation stack for type safety
type RootStackParamList = {
  Login: undefined;
  Profile: undefined;
  // Add other screen names here
};
type ProfileScreenProps = BottomTabScreenProps<MainTabsParamList, 'Profile'>;

// FIX: Define prop types for your helper components
interface StatTileProps {
  iconName: string;
  value: number;
  label: string;
  tint: string;
}
const StatTile = ({ iconName, value, label, tint }: StatTileProps) => (
  <Card className="flex-1 bg-white p-4">
    <View className="flex-row items-center">
      <Icon name={iconName} size={20} className={`${tint} mr-3`} />
      <View>
        <Text variant="headlineSmall" className="font-bold">{value}</Text>
        <Text variant="bodySmall" className="text-gray-500">{label}</Text>
      </View>
    </View>
  </Card>
);

interface EmptyProps {
  iconName: string;
  label: string;
}
const Empty = ({ iconName, label }: EmptyProps) => (
  <View className="items-center py-8">
    <Icon name={iconName} size={48} className="text-gray-300 mb-3" />
    <Text className="text-sm text-gray-500">{label}</Text>
  </View>
);

interface ProgressBarProps {
  progress: number;
  barColor: string;
}
const ProgressBar = ({ progress, barColor }: ProgressBarProps) => (
  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
    <View style={{ width: `${progress}%` }} className={`h-full ${barColor}`} />
  </View>
);

// FIX: Define types for data objects from your store
interface DailyTask {
  status: 'Completed' | 'Pending' | string;
  // add other properties of a task...
}
interface UserTarget {
  label: string;
  current: number;
  target: number;
  icon?: string;
  color?: string;
  // add other properties of a target...
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, reports, dealers, pjps, dailyTasks, dashboardStats, userTargets, setUser } = useAppStore();
  const [openLeave, setOpenLeave] = useState(false);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.clear();
    setUser(null);
    const parentNav = navigation.getParent<NativeStackNavigationProp<AppStackParamList>>();
    parentNav?.navigate({ name: 'Login', params: { onLoginSuccess: () => { } } });
  }, [setUser, navigation]);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <RNStatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="p-6">
          {/* Profile Header */}
          <View className="items-center mb-8">
            <Avatar.Text size={96} label={initials} className="bg-blue-600 shadow-lg" />
            <Text variant="headlineMedium" className="font-bold mt-4">{user?.firstName} {user?.lastName}</Text>
            <Text variant="bodyMedium" className="text-gray-500">{user?.email}</Text>
            <Chip icon="account-tie" className="mt-2 bg-blue-100 text-blue-800">{user?.role ?? "User"}</Chip>
          </View>

          {/* Stats Overview */}
          <View className="flex-row gap-4 mb-8">
            <StatTile iconName="file-document-outline" value={(reports || []).length} label="Reports" tint="text-blue-500" />
            <StatTile iconName="storefront-outline" value={(dealers || []).length} label="Dealers" tint="text-orange-500" />
          </View>
          <View className="flex-row gap-4 mb-8">
            <StatTile iconName="map-marker-distance" value={(pjps || []).length} label="PJPs" tint="text-purple-500" />
            {/* FIX: Added type for 't' in the filter method */}
            <StatTile iconName="check-circle-outline" value={(dailyTasks || []).filter((t: DailyTask) => t.status === "Completed").length} label="Tasks Done" tint="text-emerald-500" />
          </View>

          {/* Performance Section */}
          <Card className="mb-8 bg-white" mode="contained">
            <Card.Title
              title="Performance Overview"
              titleVariant="titleMedium"
              left={(props) => <Icon {...props} name="trophy-award" size={20} className="text-yellow-500" />}
            />
            <Card.Content className="space-y-4">
              {/* NOTE: This requires a fix in your Zustand store type, see below */}
              {dashboardStats?.attendance && (
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <Icon name="clock-outline" size={16} className="text-blue-500" />
                      <Text variant="bodyMedium">Today's Attendance</Text>
                    </View>
                    <Chip className={dashboardStats.attendance.isPresent ? 'bg-green-100' : 'bg-gray-100'}>
                      {dashboardStats.attendance.isPresent ? "Present" : "Absent"}
                    </Chip>
                  </View>
                  {dashboardStats.attendance.punchInTime && (
                    <Text variant="bodySmall" className="text-gray-500 ml-6">
                      Punch In: {new Date(dashboardStats.attendance.punchInTime).toLocaleTimeString()}
                    </Text>
                  )}
                </View>
              )}
              {/* FIX: Added type for 'target' in the map method */}
              {(userTargets || []).map((target: UserTarget, idx: number) => {
                const progress = Math.min(100, Math.round(((target.current ?? 0) / (target.target || 1)) * 100));
                const barColor = progress >= 80 ? "bg-emerald-500" : progress >= 60 ? "bg-yellow-500" : "bg-red-500";
                return (
                  <View key={`${target.label}-${idx}`} className="space-y-2">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Icon name={target.icon || 'target'} size={16} className={target.color} />
                        <Text variant="bodyMedium">{target.label}</Text>
                      </View>
                      <Text variant="bodySmall" className="font-mono">{target.current} / {target.target}</Text>
                    </View>
                    <ProgressBar progress={progress} barColor={barColor} />
                  </View>
                );
              })}
            </Card.Content>
          </Card>

          {/* ... The rest of your component remains the same ... */}
          <View className="space-y-4">
            <TouchableOpacity onPress={() => setOpenLeave(true)} className="flex-row items-center p-4 bg-white rounded-xl border border-gray-200">
              <Icon name="clipboard-list-outline" size={20} className="text-gray-600" />
              <Text variant="bodyLarge" className="ml-4">Apply for Leave</Text>
            </TouchableOpacity>

            <View className="p-4 bg-white rounded-xl border border-gray-200">
              <Text variant="titleSmall" className="text-gray-600 mb-2">Your Leave Applications</Text>
              <Empty iconName="clipboard-list-outline" label="No leave applications yet" />
            </View>

            <TouchableOpacity onPress={() => { /* Modal logic */ }} className="flex-row items-center p-4 bg-white rounded-xl border border-gray-200">
              <Icon name="package-variant-closed" size={20} className="text-gray-600" />
              <Text variant="bodyLarge" className="ml-4">Manage Brand Mapping</Text>
            </TouchableOpacity>
            <View className="p-4 bg-white rounded-xl border border-gray-200">
              <Text variant="titleSmall" className="text-gray-600 mb-2">Dealer-Brand Mapping</Text>
              <Empty iconName="package-variant-closed" label="No mappings yet" />
            </View>
          </View>

          {/* Logout */}
          <View className="mt-6">
            <Button mode="contained" onPress={handleLogout} buttonColor="#B91C1C" // A shade of red
              icon={() => <Icon name="logout" size={20} color="white" />}>
              Logout
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Leave Application Modal */}
      <Portal>
        <Modal visible={openLeave} onDismiss={() => setOpenLeave(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 20, borderRadius: 12 }}>
          {/* NOTE: This requires a fix in your LeaveApplicationForm file, see below */}
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