// src/reusableConstants/SideNavBar.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { List, Text, Avatar, Divider } from "react-native-paper";

const FORM_ITEMS = [
  { key: "DVRForm", label: "DVR", icon: "file-document-outline" },
  { key: "TVRForm", label: "TVR", icon: "file-chart-outline" },
  { key: "SalesOrderForm", label: "Sales Order", icon: "cart-outline" },
  { key: "LeaveApplicationForm", label: "Leave Application", icon: "calendar-clock-outline" },
  { key: "AddDealerForm", label: "Add Dealer", icon: "account-plus-outline" },
  { key: "CompetitorsInfoForm", label: "Competitors Info", icon: "chart-line" },
  { key: "PJPForm", label: "PJP", icon: "map-marker-path" },
];

export default function SideNavBar(props: DrawerContentComponentProps) {
  const { navigation } = props;

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View style={styles.userInfoSection}>
        <Avatar.Image
          source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
          size={50}
        />
        <View style={{ marginLeft: 15, flexDirection: 'column' }}>
          <Text variant="titleMedium" style={styles.title}>John Doe</Text>
          <Text variant="bodySmall" style={styles.caption}>Sales Executive</Text>
        </View>
      </View>
      <Divider style={styles.divider} />

      <List.Section>
        <List.Subheader style={styles.subheader}>Submit Forms</List.Subheader>
        {FORM_ITEMS.map((item) => (
          <List.Item
            key={item.key}
            title={item.label}
            titleStyle={styles.itemTitle}
            onPress={() => {
              navigation.navigate(item.key as never);
              navigation.closeDrawer();
            }}
            left={(p) => <List.Icon {...p} icon={item.icon} color={styles.itemTitle.color} />}
          />
        ))}
      </List.Section>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1e293b' },
  userInfoSection: { paddingLeft: 20, flexDirection: 'row', marginTop: 15, alignItems: 'center' },
  title: { color: '#e5e7eb', fontWeight: 'bold' },
  caption: { color: '#9ca3af' },
  divider: { backgroundColor: '#334155', marginVertical: 20 },
  subheader: { color: '#9ca3af', fontWeight: 'bold' },
  itemTitle: { color: '#d1d5db' },
});

