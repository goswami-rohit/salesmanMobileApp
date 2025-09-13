// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, Text, Button, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useAppStore, BASE_URL, DrawerStackParamList, MainTabsParamList, PJP } from '../components/ReusableConstants';
import AttendanceInForm from './forms/AttendanceInForm';
import AttendanceOutForm from './forms/AttendanceOutForm';
import AppHeader from '../components/AppHeader';
import PJPFloatingCard from '../components/PJPFloatingCard';
import MuiIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LiquidGlassCard from '../components/LiquidGlassCard';

export default function HomePage() {
  const theme = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const parentNavigation = useNavigation<NativeStackNavigationProp<DrawerStackParamList>>();
  const { user, attendanceStatus, setAttendanceStatus } = useAppStore();

  const [isAttendanceModalVisible, setIsAttendanceModalVisible] = useState(false);
  const [attendanceFormType, setAttendanceFormType] = useState<'in' | 'out' | null>(null);
  const [todayPJPs, setTodayPJPs] = useState<PJP[]>([]);
  const [isLoadingPJPs, setIsLoadingPJPs] = useState(true);

  useEffect(() => {
    RNStatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(theme.colors.background, false);
    }
  }, [theme]);

  // DATA IN - Fetch PJPs from API
  useEffect(() => {
    if (!user?.id) return;

    const fetchPJPs = async () => {
      setIsLoadingPJPs(true);
      try {
        const today = new Date();
        const formattedDate = format(today, 'yyyy-MM-dd');
        const url = `${BASE_URL}/api/pjp/user/${user.id}?startDate=${formattedDate}&endDate=${formattedDate}`;
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok && result.success) {
          setTodayPJPs(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch today's PJPs.");
        }
      } catch (e) {
        console.error(e);
        Toast.show({ type: 'error', text1: 'Error fetching PJPs', text2: "Could not load today's missions." });
      } finally {
        setIsLoadingPJPs(false);
      }
    };
    fetchPJPs();
  }, [user?.id]);

  // TINY HANDLERS - Connect UI to actions
  const handleAttendanceAction = useCallback((type: 'in' | 'out') => {
    setAttendanceFormType(type);
    setIsAttendanceModalVisible(true);
  }, []);

  const handleAttendanceSubmitted = useCallback(() => {
    setAttendanceStatus(attendanceFormType === 'in' ? 'in' : 'out');
    setIsAttendanceModalVisible(false);
    setAttendanceFormType(null);
  }, [attendanceFormType, setAttendanceStatus]);

  const handleAttendanceCancelled = useCallback(() => {
    setIsAttendanceModalVisible(false);
    setAttendanceFormType(null);
    Alert.alert("Action Cancelled", "Attendance submission was cancelled.");
  }, []);

  const handleCreatePJP = () => {
    parentNavigation.navigate('AddPJPForm');
  };

  const handlePJPDetails = (pjp: PJP) => {
    console.log("Viewing PJP details for:", pjp.dealerName);
    navigation.navigate('Journey', { selectedPJP: pjp });
  };

  const handleShowMorePJPs = () => {
    const today = new Date();
    parentNavigation.navigate('PJPListPage', { date: today.toISOString() });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderAttendanceForm = () => {
    if (!user?.id) {
      return (
        <View className="p-4 items-center">
          <Text>User ID not found. Cannot proceed with attendance.</Text>
          <Button onPress={handleAttendanceCancelled} className="mt-4">Close</Button>
        </View>
      );
    }

    if (attendanceFormType === 'in') {
      return (
        <AttendanceInForm
          userId={user.id}
          onSubmitted={handleAttendanceSubmitted}
          onCancel={handleAttendanceCancelled}
        />
      );
    }
    if (attendanceFormType === 'out') {
      return (
        <AttendanceOutForm
          userId={user.id}
          onSubmitted={handleAttendanceSubmitted}
          onCancel={handleAttendanceCancelled}
        />
      );
    }
    return null;
  };

  const displayedPJPs = todayPJPs.slice(0, 6);
  const hasMorePJPs = todayPJPs.length > 6;

  // UI OUT - LIQUID GLASS MAGIC WITH NATIVEWIND! 🔥
  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <AppHeader title="Home Page" />
      
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Header - LIQUID GLASS MASTERPIECE */}
        <LiquidGlassCard className="mx-4 shadow-xl" intensity={20}>
          <View className="items-center">
            <Text 
              className="text-lg font-semibold tracking-wide" 
              style={{ color: theme.colors.primary }}
            >
              {getGreeting()}
            </Text>
            <Text 
              className="text-2xl font-bold mt-1 tracking-wide" 
              style={{ color: theme.colors.onSurface }}
            >
              {user?.firstName || 'Agent'} {user?.lastName || 'Field Ops'}
            </Text>
            <Text 
              className="text-sm mt-1" 
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {user?.email || 'user@example.com'}
            </Text>
            <Text 
              className="text-xs font-semibold mt-1" 
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {user?.role || 'Field Operations Specialist'}
            </Text>
          </View>
        </LiquidGlassCard>

        {/* Attendance Buttons - LIQUID GLASS POWER */}
        <LiquidGlassCard className="mx-4 shadow-xl" intensity={18}>
          <View className="flex-row justify-between gap-4">
            <TouchableOpacity
              onPress={() => handleAttendanceAction('in')}
              disabled={attendanceStatus === 'in'}
              className="flex-1 flex-row items-center justify-center py-4 rounded-2xl gap-2"
              style={{ 
                backgroundColor: `${theme.colors.primary}CC`,
                opacity: attendanceStatus === 'in' ? 0.5 : 1
              }}
            >
              <MuiIcon name="login" size={20} color="white" />
              <Text className="text-white font-semibold text-base">Check In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleAttendanceAction('out')}
              disabled={attendanceStatus !== 'in'}
              className="flex-1 flex-row items-center justify-center py-4 rounded-2xl gap-2"
              style={{ 
                backgroundColor: `${theme.colors.secondary}CC`,
                opacity: attendanceStatus !== 'in' ? 0.5 : 1
              }}
            >
              <MuiIcon name="logout" size={20} color="white" />
              <Text className="text-white font-semibold text-base">Check Out</Text>
            </TouchableOpacity>
          </View>
        </LiquidGlassCard>

        {/* PJP Section Header - LIQUID GLASS ELEGANCE */}
        <View className="mt-6">
          <LiquidGlassCard className="mx-4 shadow-lg" intensity={12}>
            <View className="flex-row justify-between items-center">
              <Text 
                className="text-xl font-bold" 
                style={{ color: theme.colors.onSurface }}
              >
                Today's PJPs
              </Text>
              <TouchableOpacity
                onPress={handleCreatePJP}
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${theme.colors.primary}40` }}
              >
                <MuiIcon name="plus" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </LiquidGlassCard>

          {/* Loading State - LIQUID GLASS */}
          {isLoadingPJPs ? (
            <LiquidGlassCard className="mx-4 shadow-lg" intensity={15}>
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text 
                  className="mt-4 text-sm text-center" 
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Loading missions...
                </Text>
              </View>
            </LiquidGlassCard>
          ) 
          
          /* PJP List - LIQUID GLASS CARDS */
          : todayPJPs.length > 0 ? (
            <View>
              {displayedPJPs.map((pjp) => (
                <LiquidGlassCard 
                  key={pjp.id}
                  className="mx-4 shadow-lg" 
                  intensity={14}
                  onPress={() => handlePJPDetails(pjp)}
                >
                  <PJPFloatingCard
                    pjp={pjp}
                    onCardPress={() => {}} // Handled by LiquidGlassCard
                  />
                </LiquidGlassCard>
              ))}
              
              {hasMorePJPs && (
                <LiquidGlassCard className="mx-4 shadow-lg" intensity={10}>
                  <TouchableOpacity 
                    onPress={handleShowMorePJPs} 
                    className="items-center py-4"
                  >
                    <Text 
                      className="text-base font-semibold" 
                      style={{ color: theme.colors.primary }}
                    >
                      Show More ({todayPJPs.length - displayedPJPs.length})
                    </Text>
                  </TouchableOpacity>
                </LiquidGlassCard>
              )}
            </View>
          ) 
          
          /* Empty State - LIQUID GLASS */
          : (
            <LiquidGlassCard className="mx-4 shadow-lg" intensity={15}>
              <View className="items-center justify-center py-10">
                <MuiIcon 
                  name="calendar-search" 
                  size={48} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text 
                  className="mt-4 mb-4 text-sm text-center" 
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  No missions planned for today.
                </Text>
                <TouchableOpacity 
                  onPress={handleCreatePJP}
                  className="flex-row items-center justify-center py-4 px-6 rounded-2xl mt-2"
                  style={{ backgroundColor: `${theme.colors.primary}80` }}
                >
                  <Text className="text-white font-semibold text-base">
                    Plan a new mission
                  </Text>
                </TouchableOpacity>
              </View>
            </LiquidGlassCard>
          )}
        </View>
      </ScrollView>

      {/* Modal - LIQUID GLASS OVERLAY */}
      <Portal>
        <Modal
          visible={isAttendanceModalVisible}
          onDismiss={handleAttendanceCancelled}
          contentContainerStyle={{ 
            marginHorizontal: 20, 
            marginVertical: 60, 
            flex: 1, 
            backgroundColor: 'transparent' 
          }}
        >
          <LiquidGlassCard className="flex-1" intensity={25}>
            <SafeAreaView className="flex-1">
              {renderAttendanceForm()}
            </SafeAreaView>
          </LiquidGlassCard>
        </Modal>
      </Portal>
    </View>
  );
}