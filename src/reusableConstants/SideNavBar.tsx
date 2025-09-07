import React from "react";
import { StyleSheet, View } from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { List, Text } from "react-native-paper";

/**
 * SideNavBar
 * - shows a single Accordion "Forms" with a list of form screens
 * - when an item is pressed it navigates to the corresponding route name
 *
 * Route names used: they match the filenames (without extension), e.g. "AddDealerForm"
 *
 * Make sure those routes are registered in your navigator.
 */

const FORM_ITEMS = [
  { key: "DVRForm", label: "DVR" },
  { key: "TVRForm", label: "TVR" },
  { key: "SalesOrderForm", label: "Sales Order" },
  { key: "LeaveApplicationForm", label: "Leave Application" },
  { key: "AddDealerForm", label: "Add Dealer" },
  { key: "CompetitorsInfoForm", label: "Competitors Info" },
  { key: "PJPForm", label: "PJP" },
];

export default function SideNavBar(props: DrawerContentComponentProps) {
  const { navigation } = props;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.headerText}>
          Forms
        </Text>
      </View>

      <List.Section>
        <List.Accordion
          title="Submit Forms"
          left={(p) => <List.Icon {...p} icon="file-document-outline" />}
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          {FORM_ITEMS.map((item) => (
            <List.Item
              key={item.key}
              title={item.label}
              titleStyle={styles.itemTitle}
              onPress={() => {
                // navigate to the registered route, then close drawer
                navigation.navigate(item.key as never);
                navigation.closeDrawer();
              }}
              left={(p) => <List.Icon {...p} icon="chevron-right" />}
            />
          ))}
        </List.Accordion>
      </List.Section>
    </DrawerContentScrollView>
  );
}

// STYLES
const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
  header: {
    paddingLeft: 20,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  headerText: {
    color: "#fff",
    fontWeight: "600",
  },
  accordion: {
    backgroundColor: "transparent",
  },
  accordionTitle: {
    color: "#fff",
  },
  itemTitle: {
    color: "#e5e7eb",
  },
});
