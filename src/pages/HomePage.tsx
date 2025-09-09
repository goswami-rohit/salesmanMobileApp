// src/pages/HomePage.tsx 
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView, ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { Avatar, Button, Card, Text, ActivityIndicator, IconButton, Modal, Portal, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import companyLogo from '../assets/best-cement-copy.png';

// Forms for Modals and Navigation
import AddDealerForm from './forms/AddDealerForm';
import AddPJPForm from './forms/AddPJPForm';
import AttendanceInForm from './forms/AttendanceInForm';
import AttendanceOutForm from './forms/AttendanceOutForm';
import CompetitionReportForm from './forms/CompetitionReportForm';
import DVRForm from './forms/DVRForm';
import SalesOrderForm from './forms/SalesOrderForm';
import TVRForm from './forms/TVRForm';

// Zustand Store and Reusable Components
import { useAppStore, fetchCompanyByUserId, LoadingList, BASE_URL } from '../components/ReusableConstants';

// FIX: Define all your screen names here for type-safe navigation
export type HomePageParamList = {
  Login: undefined;
  HomeScreen: undefined;
  DVRForm: undefined;
  TVRForm: undefined;
  SalesOrderForm: undefined;
  AddDealerForm: undefined;
  AddPJPForm: undefined;
  CollectionForm: undefined;
  // Add any other screen names
};

// FIX: Define the shape of your Task object
interface Task {
  id: string | number;
  status: 'Completed' | 'Pending' | string;
  description: string;
  siteName?: string;
  visitType?: string;
  taskDate?: string | Date;
}

// FIX: Define props for your helper components
interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

interface ActionButtonProps {
  iconName: string;
  label: string;
  screenName: keyof HomePageParamList; // Use keys from your param list
}

// 1. API Actions Hook (Adapted for React Native)
const useAPIActions = () => {
  const { setData, user, setUser } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    try {
      const resp = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });
      if (!resp.ok) {
        // try to parse JSON error but fallback to text
        let errBody;
        try { errBody = await resp.json(); } catch { errBody = await resp.text().catch(() => null); }
        throw new Error(errBody?.error || `${resp.status} ${resp.statusText}`);
      }
      return await resp.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }, []);

  const fetchAllData = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsRefreshing(true);
    try {
      // 1) fetch user record first and set into store
      const userResp = await apiCall(`/api/users/${userId}`);
      if (userResp?.data) {
        setUser(userResp.data); // IMPORTANT: this avoids the infinite loading
      }

      // 2) run other requests in parallel (non-blocking)
      const [
        tasksRes, pjpsRes, dealersRes, // add other requests here
      ] = await Promise.allSettled([
        apiCall(`/api/daily-tasks/user/${userId}`),
        apiCall(`/api/pjp/user/${userId}`),
        apiCall(`/api/dealers/user/${userId}`),
        // ... add more endpoints as required
      ]);

      if (tasksRes.status === 'fulfilled') setData('dailyTasks', tasksRes.value.data || []);
      if (pjpsRes.status === 'fulfilled') setData('pjps', pjpsRes.value.data || []);
      if (dealersRes.status === 'fulfilled') setData('dealers', dealersRes.value.data || []);

      // consider fetching attendance/dashboard stats similarly
      Toast.show({ type: 'success', text1: 'Data Synced' });
    } catch (err: any) {
      console.warn('fetchAllData error', err);
      Toast.show({ type: 'error', text1: 'Connection Error', text2: err.message });
    } finally {
      setIsRefreshing(false);
    }
  }, [apiCall, setData, setUser]);

  const completeTask = useCallback(async (taskId: string) => {
    try {
      await apiCall(`/api/daily-tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Completed', completedAt: new Date().toISOString() }),
      });
      Toast.show({ type: 'success', text1: 'Task Completed' });
      if (user?.id) await fetchAllData(String(user.id));
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    }
  }, [apiCall, fetchAllData, user]);

  return { fetchAllData, completeTask, isRefreshing, user };
};

// 2. TaskCard Component (Recreated for React Native)
const TaskCard = ({ task, onComplete, onDelete }: TaskCardProps) => {
  const isCompleted = task.status === 'Completed';
  return (
    <Card className={`bg-white border shadow-sm ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <Card.Content>
        <View className="flex-row justify-between items-start gap-2">
          <View className="flex-1">
            <Text variant="titleMedium" className={`mb-2 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
              {task.description || 'Daily Task'}
            </Text>
            {task.siteName && (
              <View className="flex-row items-center gap-1 mb-2">
                <Icon name="map-marker-outline" size={14} color="#888" />
                <Text variant="bodySmall" className="text-gray-500">{task.siteName}</Text>
              </View>
            )}
            <View className="flex-row flex-wrap items-center gap-2">
              <Chip icon="briefcase-outline" compact>{task.visitType || "Visit"}</Chip>
              <Chip compact selected={isCompleted}>{task.status || "Assigned"}</Chip>
              {task.taskDate && <Text variant="labelSmall" className="text-gray-500">{format(new Date(task.taskDate), 'PP')}</Text>}
            </View>
          </View>
          <View>
            <IconButton icon={isCompleted ? "check-circle" : "clock-outline"} onPress={() => onComplete(String(task.id))} disabled={isCompleted} />
            <IconButton icon="trash-can-outline" iconColor="red" onPress={() => onDelete(String(task.id))} />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

// 3. Action Grid Button Component
const ActionButton = ({ iconName, label, screenName }: ActionButtonProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<HomePageParamList>>();
  return (
    <TouchableOpacity onPress={() => navigation.navigate(screenName)} className="flex-1 basis-[30%] items-center justify-center p-4 m-1 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <View className="p-3 bg-blue-100 rounded-full mb-2"><Icon name={iconName} size={24} className="text-blue-600" /></View>
      <Text variant="labelMedium" className="font-semibold text-center">{label}</Text>
    </TouchableOpacity>
  );
};

// --- Tab Content Components ---
const TodayTab = () => {
  // Uses the locally defined hook and component
  const { dailyTasks, isLoading } = useAppStore();
  const { completeTask, user } = useAPIActions();

  const todaysTasks = useMemo(() => {
    const today = new Date().toDateString();
    return (dailyTasks || []).filter(task => new Date(task.taskDate).toDateString() === today);
  }, [dailyTasks]);

  return (
    <View className="p-4">
      {isLoading ? <LoadingList /> : (
        <View className="space-y-3">
          {todaysTasks.length > 0 ? (
            todaysTasks.map(task => <TaskCard key={task.id} task={task} onComplete={completeTask} onDelete={() => { }} />)
          ) : (
            <Text className="text-center text-gray-500 mt-8">No tasks for today.</Text>
          )}
        </View>
      )}
    </View>
  );
};
const PjpsTab = () => <View><Text className="p-4 text-center">PJP Content</Text></View>;
const DealersTab = () => <View><Text className="p-4 text-center">Dealers Content</Text></View>;
// others...

// --- Main HomeScreen Component ---
export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomePageParamList>>();
  const { user, setUser, attendanceStatus, dashboardStats } = useAppStore();
  const { fetchAllData, isRefreshing } = useAPIActions();

  const [openIn, setOpenIn] = useState(false);
  const [openOut, setOpenOut] = useState(false);

  // company info state
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLogoUri, setCompanyLogoUri] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'today', title: 'Today' },
    { key: 'pjps', title: 'PJP' },
    { key: 'dealers', title: 'Dealers' },
  ]);

  const renderScene = SceneMap({ today: TodayTab, pjps: PjpsTab, dealers: DealersTab });

  useEffect(() => {
    const initializeApp = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (!storedUserId) {
        navigation.replace('Login');
        return;
      }
      // fetchAllData will fetch the user and other data and call setUser
      await fetchAllData(storedUserId);
    };
    initializeApp();
  }, [fetchAllData, navigation]);


  // Fetch user's company name once user is available
  useEffect(() => {
    let mounted = true;
    const loadCompany = async () => {
      if (!user?.id) return;
      setCompanyLoading(true);
      try {
        const comp = await fetchCompanyByUserId(Number(user.id));
        if (!mounted) return;
        if (comp) {
          setCompanyName(comp.companyName ?? null);
          // load LOGO here
          setCompanyLogoUri(Image.resolveAssetSource(companyLogo).uri);
        } else {
          setCompanyName(null);
          setCompanyLogoUri(null);
        }
      } catch (err) {
        console.warn('Could not fetch company for user:', err);
        setCompanyName(null);
        setCompanyLogoUri(null);
      } finally {
        if (mounted) setCompanyLoading(false);
      }
    };
    loadCompany();
    return () => { mounted = false; };
  }, [user]);

  const handleLogout = async () => { /* ... (same as before) ... */ };
  const onRefresh = useCallback(() => { if (user?.id) fetchAllData(String(user.id)); }, [user, fetchAllData]);
  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`;

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* -------- Company Row (fixed at top, above user header) -------- */}
        <View className="px-4 py-3 bg-white border-b border-gray-200 flex-row items-center">
          <View className="flex-row items-center gap-3">
            {/* Round company logo placeholder (will be a round image when you provide one) */}
            {companyLoading ? (
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="small" />
              </View>
            ) : companyLogoUri ? (
              <Image
                source={{ uri: companyLogoUri }}
                style={{ width: 56, height: 56, borderRadius: 28, resizeMode: 'cover', backgroundColor: '#f3f4f6' }}
              />
            ) : (
              // fallback placeholder (round)
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="domain" size={24} color="#475569" />
              </View>
            )}

            <View>
              <Text variant="titleSmall" className="font-semibold">
                {companyName ?? 'Your Company'}
              </Text>
              <Text variant="bodySmall" className="text-gray-500">
                {companyName ? 'Company' : 'No company assigned'}
              </Text>
            </View>
          </View>
        </View>

        {/* Header with user's greeting and role */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-3">
            <Avatar.Text size={44} label={initials} className="bg-blue-600" />
            <View>
              <Text variant="bodySmall" className="text-gray-500">Hello,</Text>
              <Text variant="titleMedium" className="font-bold">{user?.firstName} {user?.lastName}</Text>
              <Text variant="bodySmall" className="text-gray-500">{user?.role}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <IconButton icon="bell-outline" size={24} />
            <IconButton icon="logout" size={24} onPress={handleLogout} />
          </View>
        </View>

        {/* --- 1. Attendance Card (New Prominent Location) --- */}
        <View className="px-4 mt-2">
          <Card className="bg-white" mode="contained">
            <Card.Content>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text variant="titleMedium" className="font-bold">Daily Attendance</Text>
                  <Text variant="bodySmall" className="text-gray-500">
                    Your status is currently:
                    <Text className={`font-semibold ${attendanceStatus === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {attendanceStatus === 'in' ? ' Punched In' : ' Punched Out'}
                    </Text>
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Button
                    mode={attendanceStatus === 'out' ? "contained" : "outlined"}
                    icon="login"
                    onPress={() => setOpenIn(true)}
                    disabled={attendanceStatus === 'in'}
                    compact
                  >
                    In
                  </Button>
                  <Button
                    mode={attendanceStatus === 'in' ? "contained" : "outlined"}
                    icon="logout"
                    onPress={() => setOpenOut(true)}
                    disabled={attendanceStatus === 'out'}
                    compact
                    buttonColor={attendanceStatus === 'in' ? '#374151' : undefined} // Dark gray for active punch-out
                    textColor={attendanceStatus === 'in' ? 'white' : undefined}
                  >
                    Out
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions Grid (same as before) */}
        <View className="p-4">
          <Text variant="titleMedium" className="font-bold mb-3">Create New</Text>
          <View className="flex-row flex-wrap -m-1">
            <ActionButton iconName="file-document-outline" label="DVR" screenName="DVRForm" />
            <ActionButton iconName="tools" label="TVR" screenName="TVRForm" />
            <ActionButton iconName="cart-plus" label="Sales Order" screenName="SalesOrderForm" />
            <ActionButton iconName="store-plus-outline" label="Add Dealer" screenName="AddDealerForm" />
            <ActionButton iconName="map-marker-plus-outline" label="Plan PJP" screenName="AddPJPForm" />
            <ActionButton iconName="cash-plus" label="Collection" screenName="CollectionForm" />
          </View>
        </View>

        {/* --- 3. Performance Snapshot --- */}
        <View className="px-4 mt-6">
          <Text variant="titleMedium" className="font-bold mb-3">Performance Snapshot</Text>
          <View className="flex-row gap-4">
            <Card className="flex-1 bg-blue-50 border border-blue-200">
              <Card.Content>
                <Icon name="target" size={24} className="text-blue-600 mb-2" />
                <Text variant="labelLarge" className="text-blue-900 font-semibold">Today's Tasks</Text>
                <Text variant="headlineMedium" className="font-bold text-blue-900">{dashboardStats?.todaysTasks || 0}</Text>
              </Card.Content>
            </Card>
            <Card className="flex-1 bg-purple-50 border border-purple-200">
              <Card.Content>
                <Icon name="road-variant" size={24} className="text-purple-600 mb-2" />
                <Text variant="labelLarge" className="text-purple-900 font-semibold">Active PJPs</Text>
                <Text variant="headlineMedium" className="font-bold text-purple-900">{dashboardStats?.activePJPs || 0}</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* --- 4. Detailed Tabs (Refactored with NativeWind) --- */}
        <View className="mt-6">
          {/* NOTE: TabView needs a defined height to work inside a ScrollView.
    Using a NativeWind class here instead of an inline style.
    'h-auto' might work if the content inside is simple, but a fixed 
    or calculated height is often more reliable. Let's use flex-1
    and ensure the parent has a defined height or can flex.
    For this layout, a fixed height is safer.
  */}
          <View className="h-[600px]">
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              renderTabBar={props =>
                <TabBar
                  {...props}
                  style={{ backgroundColor: 'transparent', elevation: 0 }}
                  indicatorStyle={{ backgroundColor: '#2563eb', height: 3, borderRadius: 3 }}
                  activeColor="#2563eb"
                  inactiveColor="#6b7280"
                />
              }
            />
          </View>
        </View>

      </ScrollView>

      {/* --- Modals for Punch In/Out (Now using real forms) --- */}
      <Portal>
        <Modal visible={openIn} onDismiss={() => setOpenIn(false)} contentContainerStyle={{ backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 }}>
          <AttendanceInForm userId={user.id} onSubmitted={() => { setOpenIn(false); onRefresh(); }} onCancel={() => setOpenIn(false)} />
        </Modal>
        <Modal visible={openOut} onDismiss={() => setOpenOut(false)} contentContainerStyle={{ backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 }}>
          <AttendanceOutForm userId={user.id} onSubmitted={() => { setOpenOut(false); onRefresh(); }} onCancel={() => setOpenOut(false)} />
        </Modal>
      </Portal>

    </SafeAreaView>
  );
}