// src/components/SideDrawer.tsx 
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";

import BottomNavBar from "./BottomNavBar";
import SideNavBar from "./SideNavBar";

// Import ALL form screens
import DVRForm from "../pages/forms/DVRForm";
import TVRForm from "../pages/forms/TVRForm";
import AttendanceInForm from "../pages/forms/AttendanceInForm";
import AttendanceOutForm from "../pages/forms/AttendanceOutForm";
import LeaveApplicationForm from "../pages/forms/LeaveApplicationForm";
import PJPForm from "../pages/forms/AddPJPForm";
import SalesOrderForm from "../pages/forms/SalesOrderForm";
import AddDealerForm from "../pages/forms/AddDealerForm";
import CompetitionReportForm from "../pages/forms/CompetitionReportForm";


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
            <Stack.Screen name="AttendanceInForm" component={AttendanceInForm} />
            <Stack.Screen name="AttendanceOutForm" component={AttendanceOutForm} />
            <Stack.Screen name="PJPForm" component={PJPForm} />
            <Stack.Screen name="DVRForm" component={DVRForm} />
            <Stack.Screen name="TVRForm" component={TVRForm} />
            <Stack.Screen name="AddDealerForm" component={AddDealerForm} />
            <Stack.Screen name="SalesOrderForm" component={SalesOrderForm} />
            <Stack.Screen name="CompetitionReportForm" component={CompetitionReportForm} />
            <Stack.Screen name="LeaveApplicationForm" component={LeaveApplicationForm} />
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