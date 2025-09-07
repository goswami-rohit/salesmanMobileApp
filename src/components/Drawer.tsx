import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";

import BottomNavBar from "../reusableConstants/BottomNavBar";
import SideNavBar from "../reusableConstants/SideNavBar";

// Import ALL form screens
import AddDealerForm from "../pages/forms/AddDealerForm";
import CompetitorsInfoForm from "../pages/forms/CompetitorsInfoForm";
import DVRForm from "../pages/forms/DVRForm";
import LeaveApplicationForm from "../pages/forms/LeaveApplicationForm";
import PJPForm from "../pages/forms/PJPForm";
import SalesOrderForm from "../pages/forms/SalesOrderForm";
import TVRForm from "../pages/forms/TVRForm";
import AttendanceInForm from "../pages/forms/AttendanceInForm";
import AttendanceOutForm from "../pages/forms/AttendanceOutForm";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// This Stack Navigator is the parent that contains BOTH the main tabs and all the forms.
// This allows navigation between them.
function RootStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Screen 1: The entire Bottom Tab navigator */}
            <Stack.Screen name="MainTabs" component={BottomNavBar} />

            {/* All other form screens are siblings in the same stack */}
            <Stack.Screen name="DVRForm" component={DVRForm} />
            <Stack.Screen name="TVRForm" component={TVRForm} />
            <Stack.Screen name="SalesOrderForm" component={SalesOrderForm} />
            <Stack.Screen name="AddDealerForm" component={AddDealerForm} />
            <Stack.Screen name="CompetitorsInfoForm" component={CompetitorsInfoForm} />
            <Stack.Screen name="LeaveApplicationForm" component={LeaveApplicationForm} />
            <Stack.Screen name="PJPForm" component={PJPForm} />
            <Stack.Screen name="AttendanceInForm" component={AttendanceInForm} />
            <Stack.Screen name="AttendanceOutForm" component={AttendanceOutForm} />
        </Stack.Navigator>
    );
}

// The Drawer now wraps the entire RootStack
export default function AppDrawer() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <SideNavBar {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: Platform.OS === "android" ? "front" : "slide",
                drawerStyle: {
                    backgroundColor: '#0f172a',
                    width: 260,
                }
            }}
        >
            <Drawer.Screen name="Root" component={RootStack} />
        </Drawer.Navigator>
    );
}