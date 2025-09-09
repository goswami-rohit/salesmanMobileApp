// src/components/ReusableConstants.tsx
import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Button, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { create } from 'zustand';
import RNPickerSelect from 'react-native-picker-select';
// Reusable constants in forms

// --- STATE MANAGEMENT (Zustand) & INTERFACES ---
// No changes are needed here. Zustand works perfectly in React Native.

export interface UserShape {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface AppState {
  user: UserShape | null
  currentPage: "home" | "ai" | "journey" | "profile"
  attendanceStatus: "in" | "out"
  isLoading: boolean
  isOnline: boolean
  lastSync: Date | null

  dailyTasks: any[]
  pjps: any[]
  dealers: any[]
  reports: any[]
  tvrReports: any[]
  salesReports: any[]
  collectionReports: any[]
  clientReports: any[]
  competitionReports: any[]
  dealerBrandMappings: any[]
  ddpReports: any[]
  leaveApplications: any[]
  brands: any[]
  ratings: any[]
  attendanceHistory: any[]
  userTargets: any[]
  dealerScores: any[]
  dashboardStats: {
    todaysTasks: number;
    activePJPs: number;
    totalDealers: number;
    totalReports: number;
    attendance?: {
      isPresent: boolean;
      punchInTime?: string | Date;
    };
  }

  showCreateModal: boolean
  createType: "task" | "pjp" | "dealer" | "dvr" | "tvr" | "dealer-score" | "sales-report" | "collection-report" | "dealer-brand-mapping" | "ddp" | "leave-application"
  selectedItem: any
  showDetailModal: boolean

  setUser: (u: UserShape | null) => void
  setCurrentPage: (p: AppState["currentPage"]) => void
  setAttendanceStatus: (s: AppState["attendanceStatus"]) => void
  setLoading: (b: boolean) => void
  setOnlineStatus: (b: boolean) => void
  updateLastSync: () => void
  setData: (k: string, data: any) => void
  setUIState: (k: string, v: any) => void
  resetModals: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentPage: "home",
  attendanceStatus: "out",
  isLoading: false,
  isOnline: true,
  lastSync: null,

  dailyTasks: [],
  pjps: [],
  dealers: [],
  reports: [],
  tvrReports: [],
  salesReports: [],
  collectionReports: [],
  clientReports: [],
  competitionReports: [],
  dealerBrandMappings: [],
  ddpReports: [],
  leaveApplications: [],
  brands: [],
  ratings: [],
  attendanceHistory: [],
  userTargets: [],
  dealerScores: [],
  dashboardStats: {
    todaysTasks: 0,
    activePJPs: 0,
    totalDealers: 0,
    totalReports: 0
  },

  showCreateModal: false,
  createType: "task",
  selectedItem: null,
  showDetailModal: false,

  setUser: (user) => set({ user }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setAttendanceStatus: (attendanceStatus) => set({ attendanceStatus }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnlineStatus: (isOnline) => set({ isOnline }),
  updateLastSync: () => set({ lastSync: new Date() }),
  setData: (key, data) => set({ [key]: data } as any),
  setUIState: (key, value) => set({ [key]: value } as any),
  resetModals: () => set({ showCreateModal: false, showDetailModal: false, selectedItem: null }),
}))


// --- REUSABLE UI COMPONENTS (Converted for React Native) ---

export const StatusBar = () => {
  const { isOnline, lastSync } = useAppStore();
  return (
    <View className="flex-row items-center justify-between px-4 py-2 bg-white/95 border-b border-gray-200">
      <View className="flex-row items-center gap-2">
        <View className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
        <Text variant="labelSmall" className="text-gray-600">{isOnline ? "Online" : "Offline"}</Text>
      </View>
      {lastSync && (
        <Text variant="labelSmall" className="text-gray-500">
          Last sync: {lastSync.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
};

export const LoadingList = ({ rows = 3 }: { rows?: number }) => (
  <View className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Card key={i} className="bg-white/80 border-0 shadow-sm" mode="contained">
        <Card.Content>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 rounded-full bg-gray-200" />
            <View className="flex-1 space-y-2">
              <View className="h-4 w-3/4 rounded bg-gray-200" />
              <View className="h-3 w-1/2 rounded bg-gray-200" />
            </View>
          </View>
        </Card.Content>
      </Card>
    ))}
  </View>
);

// StatTile was already converted in ProfileScreen, it can live here permanently.
export const StatTile = ({ iconName, value, label, tint }: { iconName: string; value: number; label: string; tint: string }) => (
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

export const DEALER_TYPES = ["Dealer-Best", "Sub Dealer-Best", "Dealer-Non Best", "Sub Dealer-Non Best",] as const;
export const BRANDS = ["Star", "Amrit", "Dalmia", "Topcem", "Black Tiger", "Surya Gold", "Max", "Taj", "Specify in remarks"];
export const UNITS = ["MT", "KG", "Bags"] as const;
export const FEEDBACKS = ["Interested", "Not Interested", "Follow-up Required"];

// Dynamically fetch area and regions of dealers/sub dealers from NEON later
export const REGIONS = ["Kamrup M", "Kamrup", "Karbi Anglong", "Dehmaji"];
export const AREAS = ["Guwahati", "Beltola", "Zoo Road", "Tezpur", "Diphu", "Nagaon", "Barpeta"];

// TVR specific consts
export const INFLUENCERS = [
  "Contractor",
  "Engineer",
  "Architect",
  "Mason",
  "Builder",
  "Petty Contractor",
];

export const QUALITY_COMPLAINT = [
  "Slow Setting",
  "Low weight",
  "Colour issues",
  "Cracks",
  "Miscellaneous",
];

export const PROMO_ACTIVITY = [
  "Mason Meet",
  "Table meet / Counter meet",
  "Mega mason meet",
  "Engineer meet",
  "Consumer Camp",
  "Miscellaneous",
];

export const CHANNEL_PARTNER_VISIT = [
  "Dealer Visit",
  "Sub dealer",
  "Authorized retailers",
  "Other Brand counters",
];
// end TVR specific consts

// New constants for PJP Form
export const PJP_STATUS = ["planned", "active", "completed", "cancelled"] as const;