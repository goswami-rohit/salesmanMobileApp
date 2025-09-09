// src/reusableConstants/SideNavBar.tsx
import React from "react";
import { View } from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Avatar, Text, List, Divider } from "react-native-paper";
import { useNavigation, CompositeNavigationProp, NavigatorScreenParams } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Import your centralized navigation types and the Zustand store
import { DrawerStackParamList, MainTabsParamList } from "./ReusableConstants";
import { useAppStore } from "./ReusableConstants";

// --- Type Definitions ---
type FormItem = {
  key: keyof DrawerStackParamList;
  label: string;
  icon: string;
};

// FIX: Define the parameters for the Drawer navigator itself.
// This tells TypeScript that the 'Root' screen can accept parameters for the nested stack.
type AppDrawerParamList = {
  Root: NavigatorScreenParams<DrawerStackParamList>;
};

// FIX: Create a fully-typed composite navigation prop that understands both navigators.
type SideNavBarNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<AppDrawerParamList, 'Root'>,
  NativeStackNavigationProp<DrawerStackParamList>
>;


// --- Constants ---
const FORM_ITEMS: FormItem[] = [
  { key: "DVRForm", label: "Daily Visit Report", icon: "clipboard-text-outline" },
  { key: "TVRForm", label: "Technical Visit Report", icon: "tools" },
  { key: "SalesOrderForm", label: "Sales Order", icon: "cart-plus" },
  { key: "LeaveApplicationForm", label: "Leave Application", icon: "calendar-check-outline" },
  { key: "AddDealerForm", label: "Add Dealer", icon: "store-plus-outline" },
  { key: "CompetitionReportForm", label: "Competition Report", icon: "chart-line-variant" },
  { key: "AddPJPForm", label: "Plan Journey (PJP)", icon: "map-marker-path" },
];

// --- Component ---
export default function SideNavBar(props: DrawerContentComponentProps) {
  const { user } = useAppStore();
  // Use the correctly typed navigation hook
  const navigation = useNavigation<SideNavBarNavigationProp>();

  const getInitials = () => {
    const first = user?.firstName?.[0] || "";
    const last = user?.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "JD";
  };

  const navigateToNested = (screenName: keyof DrawerStackParamList) => {
    if (screenName === "MainTabs") {
      // Always drop users into Home tab if MainTabs is clicked
      navigation.navigate("Root", { screen: "MainTabs", params: { screen: "Home" } });
    } else {
      navigation.navigate("Root", { screen: screenName });
    }
    navigation.closeDrawer();
  };

  const navigateToDashboard = () => {
    navigation.navigate("Root", { screen: "MainTabs", params: { screen: "Home" } });
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} className="bg-slate-900">
      {/* User Header */}
      <View className="p-5 flex-row items-center">
        <Avatar.Text size={50} label={getInitials()} className="bg-blue-600" />
        <View className="ml-4">
          <Text variant="titleMedium" className="text-slate-200 font-bold">
            {user ? `${user.firstName} ${user.lastName}` : "John Doe"}
          </Text>
          <Text variant="bodySmall" className="text-slate-400">
            {user?.role || "Sales Executive"}
          </Text>
        </View>
      </View>
      <Divider className="bg-slate-700" />

      {/* Dashboard Link */}
      <List.Item
        title="Dashboard"
        titleStyle={{ color: "#e5e7eb", fontWeight: "600" }}
        left={(p) => <List.Icon {...p} icon="home-variant-outline" color="#e5e7eb" />}
        onPress={navigateToDashboard}
      />
      <Divider className="bg-slate-700" />

      {/* Forms Section */}
      <List.Section>
        <List.Subheader className="text-slate-400 font-bold tracking-wider pt-4">
          Submit Reports & Forms
        </List.Subheader>
        {FORM_ITEMS.map((item) => (
          <List.Item
            key={item.key}
            title={item.label}
            titleStyle={{ color: "#d1d5db", fontSize: 14 }}
            onPress={() => navigateToNested(item.key)}
            left={(p) => <List.Icon {...p} icon={item.icon} color="#d1d5db" />}
          />
        ))}
      </List.Section>
    </DrawerContentScrollView>
  );
}

