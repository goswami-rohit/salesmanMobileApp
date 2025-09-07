import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {
  Avatar,
  Text,
  useTheme,
  List,
  Divider,
} from 'react-native-paper';

const FORM_ITEMS = [
  { key: 'DVRForm', label: 'Daily Visit Report (DVR)' },
  { key: 'TVRForm', label: 'Technical Visit Report (TVR)' },
  { key: 'SalesOrderForm', label: 'Sales Order' },
  { key: 'LeaveApplicationForm', label: 'Leave Application' },
  { key: 'AddDealerForm', label: 'Add Dealer' },
  { key: 'CompetitorsInfoForm', label: 'Competitors Info' },
  { key: 'PJPForm', label: 'Planned Journey Plan (PJP)' },
];

export default function SideNavBar(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const theme = useTheme();

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: theme.colors.surface }}
    >
      {/* User Profile Section */}
      <View style={styles.userInfoSection}>
        <Avatar.Image
          source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
          size={50}
        />
        <View style={{ marginLeft: 15, flexDirection: 'column' }}>
          <Text variant="titleMedium" style={styles.title}>John Doe</Text>
          <Text style={styles.caption} variant="bodySmall">Sales Executive</Text>
        </View>
      </View>
      <Divider style={styles.divider} />

      {/* Navigation to Home page */}
      <List.Item
        title="Home Page"
        titleStyle={styles.navItemTitle}
        left={(props) => <List.Icon {...props} icon="home-variant-outline" color="#e5e7eb" />}
        onPress={() => {
          // Navigate to the Home screen within the MainTabs navigator
          navigation.navigate('MainTabs', { screen: 'Home' });
          navigation.closeDrawer();
        }}
      />
      <Divider style={styles.divider} />
      
      {/* Forms Section */}
      <List.Section>
        <List.Subheader style={styles.subheader}>Submit Reports & Forms</List.Subheader>
        {FORM_ITEMS.map((item) => (
          <List.Item
            key={item.key}
            title={item.label}
            titleStyle={styles.itemTitle}
            onPress={() => {
              navigation.navigate(item.key);
              navigation.closeDrawer();
            }}
            left={(props) => (
              <List.Icon {...props} icon="chevron-right" color={styles.itemTitle.color} />
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#e5e7eb',
    fontWeight: 'bold',
  },
  caption: {
    color: '#9ca3af',
  },
  divider: {
    backgroundColor: '#334155',
  },
  navItemTitle: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  subheader: {
    color: '#9ca3af',
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingLeft: 20,
    marginTop: 10,
  },
  itemTitle: {
    color: '#d1d5db',
    fontSize: 14,
  },
});