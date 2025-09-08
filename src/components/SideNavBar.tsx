// src/reusableConstants/SideNavBar.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import {
  Avatar,
  Text,
  useTheme,
  List,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { getUser, getCompany, User, Company } from "../backendConnections/apiServices";

/**
 * IMPORTANT:
 * - This Drawer has a single Drawer.Screen called "Root" (see src/components/SideDrawer.tsx).
 * - The Root screen hosts a nested Stack (RootStack) which contains screens with names:
 *   "DVRForm", "TVRForm", "SalesOrderForm", "LeaveApplicationForm", "AddDealerForm",
 *   "CompetitionReportForm", "AddPJPForm", "MainTabs", etc.
 *
 * If any of the names below don't match the names you used in RootStack, update them.
 */
const ROOT_DRAWER_NAME = "Root";

const FORM_ITEMS = [
  { key: "DVRForm", label: "Daily Visit Report (DVR)" },
  { key: "TVRForm", label: "Technical Visit Report (TVR)" },
  { key: "SalesOrderForm", label: "Sales Order" },
  { key: "LeaveApplicationForm", label: "Leave Application" },
  { key: "AddDealerForm", label: "Add Dealer" },
  { key: "CompetitionReportForm", label: "Competition Report" },
  { key: "AddPJPForm", label: "Planned Journey Plan (PJP)" },
];

export default function SideNavBar(props: DrawerContentComponentProps) {
  const { navigation } = props as any; // cast to any to avoid TS overload grief
  const theme = useTheme();

  // --- State for dynamic data ---
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    // kept disabled in your original code — leave as-is but guard for real usage
    const fetchData = async () => {
      try {
        const currentUserId = 1;
        const userResult = await getUser(currentUserId);
        if (userResult.success && userResult.data) {
          setUser(userResult.data);
          const companyResult = await getCompany(userResult.data.companyId);
          if (companyResult.success) setCompany(companyResult.data);
        }
      } catch (e) {
        // swallow errors for now; don't block UI
      } finally {
        setIsLoading(false);
      }
    };

    // If you want real fetching, uncomment:
    // fetchData();

    // For now preserve previous behaviour: no fetch, just hide loader.
    setIsLoading(false);
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  const renderUserInfo = () => {
    if (isLoading) {
      return (
        <View style={styles.userInfoSection}>
          <ActivityIndicator animating />
        </View>
      );
    }

    if (user) {
      return (
        <View style={styles.userInfoSection}>
          <Avatar.Text size={50} label={getInitials(user.firstName, user.lastName)} />
          <View style={{ marginLeft: 15, flexDirection: "column" }}>
            <Text variant="titleMedium" style={styles.title}>
              {`${user.firstName} ${user.lastName}`}
            </Text>
            <Text style={styles.caption} variant="bodySmall">
              {company?.companyName || user.role}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.userInfoSection}>
        <Avatar.Text size={50} label="JD" />
        <View style={{ marginLeft: 15, flexDirection: "column" }}>
          <Text variant="titleMedium" style={styles.title}>
            John Doe
          </Text>
          <Text style={styles.caption} variant="bodySmall">
            Sales Executive
          </Text>
        </View>
      </View>
    );
  };

  // core: navigate into the nested Root stack
  function navigateToNested(screenName: string) {
    // Tell Drawer to open Drawer.Screen 'Root' and request the nested screen.
    // Casting to 'never' quiets TypeScript's overloaded navigate types.
    navigation.navigate(ROOT_DRAWER_NAME as never, { screen: screenName } as never);
    navigation.closeDrawer();
  }

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.surface }}>
      {/* user header */}
      {renderUserInfo()}
      <Divider style={styles.divider} />

      {/* Dashboard — navigate into Root -> MainTabs -> Home */}
      <List.Item
        title="Dashboard"
        titleStyle={styles.navItemTitle}
        left={(p) => <List.Icon {...p} icon="home-variant-outline" color="#e5e7eb" />}
        onPress={() => {
          navigation.navigate(
            ROOT_DRAWER_NAME as never,
            { screen: "MainTabs", params: { screen: "Home" } } as never
          );
          navigation.closeDrawer();
        }}
      />
      <Divider style={styles.divider} />

      {/* Forms */}
      <List.Section>
        <List.Subheader style={styles.subheader}>Submit Reports & Forms</List.Subheader>
        {FORM_ITEMS.map((item) => (
          <List.Item
            key={item.key}
            title={item.label}
            titleStyle={styles.itemTitle}
            onPress={() => navigateToNested(item.key)}
            left={(p) => <List.Icon {...p} icon="chevron-right" color={styles.itemTitle.color} />}
          />
        ))}
      </List.Section>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  userInfoSection: {
    paddingLeft: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 90,
  },
  title: {
    color: "#e5e7eb",
    fontWeight: "bold",
  },
  caption: {
    color: "#9ca3af",
  },
  divider: {
    backgroundColor: "#334155",
  },
  navItemTitle: {
    color: "#e5e7eb",
    fontWeight: "600",
  },
  subheader: {
    color: "#9ca3af",
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingLeft: 20,
    marginTop: 10,
  },
  itemTitle: {
    color: "#d1d5db",
    fontSize: 14,
  },
});