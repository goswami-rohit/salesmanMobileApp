// src/components/SideDrawer.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";

import BottomNavBar from "./BottomNavBar";
import SideNavBar from "./SideNavBar";

// Import form screens
import AddPJPForm from "../pages/forms/AddPJPForm";
import AddDealerForm from "../pages/forms/AddDealerForm";
import AddSiteForm from "../pages/forms/AddSiteForm";
import DailyTasksForm from "../pages/forms/DailyTasksForm";
import CompetitionReportForm from "../pages/forms/CompetitionReportForm";
import DVRForm from "../pages/forms/DVRForm";
import LeaveApplicationForm from "../pages/forms/LeaveApplicationForm";
import SalesOrderForm from "../pages/forms/SalesOrderForm";
import TVRForm from "../pages/forms/TVRForm";

import { DrawerStackParamList } from "../components/ReusableConstants";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator<DrawerStackParamList>();

// --- Stack Navigator for Main Content and Forms ---
function RootStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      {/* Main Bottom Navigation */}
      <Stack.Screen
        name="MainTabs"
        component={BottomNavBar}
      />

      {/* Forms launched from the drawer */}
      <Stack.Screen name="DVRForm" component={DVRForm} />
      <Stack.Screen name="TVRForm" component={TVRForm} />
      <Stack.Screen name="SalesOrderForm" component={SalesOrderForm} />
      <Stack.Screen name="AddPJPForm" component={AddPJPForm} />
      <Stack.Screen name="AddDealerForm" component={AddDealerForm} />
      <Stack.Screen name="AddSiteForm" component={AddSiteForm} />
      <Stack.Screen name="DailyTasksForm" component={DailyTasksForm} />
      <Stack.Screen name="CompetitionReportForm" component={CompetitionReportForm} />
      <Stack.Screen name="LeaveApplicationForm" component={LeaveApplicationForm} />
    </Stack.Navigator>
  );
}

// --- Main Drawer Navigator ---
export default function AppDrawer() {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <SideNavBar {...props} />
      )}
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        drawerStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Drawer.Screen
        name="Root"
        component={RootStack}
      />
    </Drawer.Navigator>
  );
}