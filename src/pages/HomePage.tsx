// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Card, Text, Button, Portal, Modal, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isSameDay, format } from 'date-fns';
import Toast from 'react-native-toast-message';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useAppStore, BASE_URL, DrawerStackParamList, MainTabsParamList, PJP } from '../components/ReusableConstants';
import AttendanceInForm from './forms/AttendanceInForm';
import AttendanceOutForm from './forms/AttendanceOutForm';
import AppHeader from '../components/AppHeader';
import PJPFloatingCard from '../components/PJPFloatingCard'; // FIX: Changed import name
import MuiIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');


export default function HomePage() {
  const theme = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const parentNavigation = useNavigation<NativeStackNavigationProp<DrawerStackParamList>>();
  const { top } = useSafeAreaInsets();
  const { user, attendanceStatus, setAttendanceStatus, dailyTasks } = useAppStore();

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

  // Fetch PJPs from API on component mount
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
        <View style={styles.modalContent}>
          <Text>User ID not found. Cannot proceed with attendance.</Text>
          <Button onPress={handleAttendanceCancelled} style={styles.modalButton}>Close</Button>
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title="Mission Control" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Header */}
        <View style={[styles.header, { paddingTop: 0 }]}>
          <Text style={[styles.greetingText, { color: theme.colors.primary }]}>{getGreeting()}</Text>
          <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
            {user?.firstName || 'Agent'} {user?.lastName || 'Field Ops'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{user?.email || 'user@example.com'}</Text>
          <Text style={[styles.userRole, { color: theme.colors.onSurfaceVariant }]}>{user?.role || 'Field Operations Specialist'}</Text>
        </View>

        {/* Attendance Buttons */}
        <View style={styles.attendanceButtonsContainer}>
          <Button
            mode="contained"
            onPress={() => handleAttendanceAction('in')}
            disabled={attendanceStatus === 'in'}
            style={[styles.attendanceButton, { backgroundColor: theme.colors.primary }]}
            icon="login"
          >
            Check In
          </Button>
          <Button
            mode="contained"
            onPress={() => handleAttendanceAction('out')}
            disabled={attendanceStatus !== 'in'}
            style={[styles.attendanceButton, { backgroundColor: theme.colors.secondary }]}
            icon="logout"
          >
            Check Out
          </Button>
        </View>

        {/* PJP Overview Section */}
        <View style={styles.pjpSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Today's Missions
            </Text>
            <IconButton
              icon="plus"
              onPress={handleCreatePJP}
              size={24}
              iconColor={theme.colors.primary}
              style={[styles.pjpPlusButton, { backgroundColor: theme.colors.surfaceVariant }]}
            />
          </View>

          {isLoadingPJPs ? (
            <View style={styles.pjpEmptyCardContent}>
              <ActivityIndicator size="large" />
              <Text style={[styles.pjpEmptyText, { color: theme.colors.onSurfaceVariant }]}>Loading missions...</Text>
            </View>
          ) : todayPJPs.length > 0 ? (
            <View>
              {displayedPJPs.map((pjp) => (
                <PJPFloatingCard
                  key={pjp.id}
                  pjp={pjp}
                  onCardPress={handlePJPDetails}
                />
              ))}
              {hasMorePJPs && (
                <Button mode="text" onPress={handleShowMorePJPs} style={{ marginTop: 8 }}>
                  Show More ({todayPJPs.length - displayedPJPs.length})
                </Button>
              )}
            </View>
          ) : (
            <Card style={[styles.pjpEmptyCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content style={styles.pjpEmptyCardContent}>
                <MuiIcon name="calendar-search" size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.pjpEmptyText, { color: theme.colors.onSurfaceVariant }]}>No missions planned for today.</Text>
                <Button mode="outlined" onPress={handleCreatePJP} style={styles.pjpEmptyButton}>
                  Plan a new mission
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreatePJP}
      >
        <MaterialCommunityIcons name="plus" size={28} color={theme.colors.onPrimary} />
      </TouchableOpacity>

      {/* Attendance Modals */}
      <Portal>
        <Modal
          visible={isAttendanceModalVisible}
          onDismiss={handleAttendanceCancelled}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {renderAttendanceForm()}
          </SafeAreaView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  attendanceButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  attendanceButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pjpSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pjpPlusButton: {
    borderRadius: 12,
  },
  pjpList: {
    paddingRight: 16,
  },
  pjpEmptyCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pjpEmptyCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  pjpEmptyText: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 14,
  },
  pjpEmptyButton: {
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  modalContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 8,
    flex: 1,
  },
  modalContent: {
    padding: 16,
    alignItems: 'center',
  },
  modalButton: {
    marginTop: 16,
  },
});