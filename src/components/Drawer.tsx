import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Platform } from "react-native";

import BottomNavBar from "../reusableConstants/BottomNavBar"; // Corrected path
import SideNavBar from "../reusableConstants/SideNavBar"; // the accordion menu you made

// Import the form screens you generated earlier:
import AddDealerForm from "../pages/forms/AddDealerForm";
import CompetitorsInfoForm from "../pages/forms/CompetitorsInfoForm";
import DVRForm from "../pages/forms/DVRForm";
import LeaveApplicationForm from "../pages/forms/LeaveApplicationForm";
import PJPForm from "../pages/forms/PJPForm";
import SalesOrderForm from "../pages/forms/SalesOrderForm";
import TVRForm from "../pages/forms/TVRForm";

// Optional: import other top-level screens if you want them in the drawer too
// e.g. Profile, Settings, etc.

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
    return (
        <Drawer.Navigator
            // use your SideNavBar as the custom drawer content
            drawerContent={(props) => <SideNavBar {...props} />}
            screenOptions={{
                // keep header hidden (we use headers inside individual stacks/screens if needed)
                headerShown: false,
                drawerType: Platform.OS === "android" ? "front" : "slide",
                // @ts-ignore - This is the correct prop, but type definitions might be outdated.
                sceneContainerStyle: { backgroundColor: "#0f172a" },
            }}
        >
            {/* The main app content is the bottom tabs */}
            <Drawer.Screen name="Tabs" component={BottomNavBar} />

            {/* Register forms as independent screens so SideNavBar can navigate to them */}
            <Drawer.Screen name="DVRForm" component={DVRForm} />
            <Drawer.Screen name="TVRForm" component={TVRForm} />
            <Drawer.Screen name="SalesOrderForm" component={SalesOrderForm} />
            <Drawer.Screen name="AddDealerForm" component={AddDealerForm} />
            <Drawer.Screen name="CompetitorsInfoForm" component={CompetitorsInfoForm} />
            <Drawer.Screen name="LeaveApplicationForm" component={LeaveApplicationForm} />
            <Drawer.Screen name="PJPForm" component={PJPForm} />
        </Drawer.Navigator>
    );
}

