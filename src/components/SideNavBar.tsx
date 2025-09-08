// src/reusableConstants/SideNavBar.tsx
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native-paper';
import { getUser, getCompany, User, Company } from '../backendConnections/apiServices'; // Import new functions and types

const FORM_ITEMS = [
  { key: 'DVRForm', label: 'Daily Visit Report (DVR)' },
  { key: 'TVRForm', label: 'Technical Visit Report (TVR)' },
  { key: 'SalesOrderForm', label: 'Sales Order' },
  { key: 'LeaveApplicationForm', label: 'Leave Application' },
  { key: 'AddDealerForm', label: 'Add Dealer' },
  { key: 'CompetitionReportForm', label: 'Competition Report' },
  { key: 'PJPForm', label: 'Planned Journey Plan (PJP)' },
];

export default function SideNavBar(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const theme = useTheme();

  // --- State for dynamic data ---
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchData = async () => {
      // In a real app, you would get the userId from a global state/context
      const currentUserId = 1; 
      
      const userResult = await getUser(currentUserId);
      if (userResult.success && userResult.data) {
        setUser(userResult.data);
        // Fetch company data based on the user's companyId
        const companyResult = await getCompany(userResult.data.companyId);
        if (companyResult.success) {
          setCompany(companyResult.data);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const renderUserInfo = () => {
    if (isLoading) {
      return (
        <View style={styles.userInfoSection}>
          <ActivityIndicator animating={true} />
        </View>
      );
    }

    if (!user) {
      return (
         <View style={styles.userInfoSection}>
            <Text style={styles.caption}>Could not load user data.</Text>
         </View>
      );
    }
    
    return (
      <View style={styles.userInfoSection}>
        <Avatar.Text
          size={50}
          label={getInitials(user.firstName, user.lastName)}
        />
        <View style={{ marginLeft: 15, flexDirection: 'column' }}>
          <Text variant="titleMedium" style={styles.title}>
            {`${user.firstName} ${user.lastName}`}
          </Text>
          <Text style={styles.caption} variant="bodySmall">
            {company?.companyName || user.role}
          </Text>
        </View>
      </View>
    );
  };


  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: theme.colors.surface }}
    >
      {/* User Profile Section */}
      {renderUserInfo()}
      <Divider style={styles.divider} />

      {/* Navigation to Dashboard */}
      <List.Item
        title="Dashboard"
        titleStyle={styles.navItemTitle}
        left={(props) => <List.Icon {...props} icon="home-variant-outline" color="#e5e7eb" />}
        onPress={() => {
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
    minHeight: 90, // Ensure consistent height during loading
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

