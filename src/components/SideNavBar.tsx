// src/components/SideNavBar.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- User Profile Component ---
const UserProfile: React.FC<{ user: any; theme: any }> = ({ user, theme }) => {
  return (
    <View style={styles.profileContainer}>
      <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.avatarText}>
          {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'G'}
        </Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user?.firstName || 'Agent'} {user?.lastName || 'Field Ops'}
        </Text>
        <Text style={[styles.userRole, { color: theme.colors.onSurface }]}>
          {user?.role || 'Field Operations Specialist'}
        </Text>
        <Text style={[styles.userCompany, { color: theme.colors.onSurfaceVariant }]}>
          {user?.companyName || 'Field Operations HQ'}
        </Text>
      </View>
    </View>
  );
};

// --- Menu Item Component ---
const MenuItem: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  theme: any;
}> = ({ icon, label, onPress, theme }) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
        <Icon name={icon} size={22} color={theme.colors.onPrimary} />
      </View>

      <Text style={[styles.menuLabel, { color: theme.colors.onSurface }]}>{label}</Text>

      <View style={styles.arrowContainer}>
        <Icon name="chevron-right" size={20} color={theme.colors.onSurface} />
      </View>
    </TouchableOpacity>
  );
};

// --- Main SideNavBar Component ---
export default function SideNavBar(props: any) {
  const theme = useTheme();

  // Mock user data (replace with actual user data)
  // const user = {
  //   firstName: 'Agent',
  //   lastName: 'Field',
  //   role: 'Neural Operations Specialist',
  //   companyName: 'Mission Control HQ',
  // };

  const menuItems = [
    { icon: 'view-dashboard', label: 'Home Page', screen: 'MainTabs' },

    { icon: 'file-document', label: 'Create DVR', screen: 'DVRForm' },
    { icon: 'file-chart', label: 'Create TVR', screen: 'TVRForm' },
    { icon: 'cart-plus', label: 'Sales Order', screen: 'SalesOrderForm' },
    { icon: 'plus-circle', label: 'Add PJP', screen: 'AddPJPForm' },
    { icon: 'office-building', label: 'Add Dealer|Sub-Dealer', screen: 'AddDealerForm' },
    { icon: 'map-marker-plus', label: 'Add Site', screen: 'AddSiteForm' },
    { icon: 'clipboard-list', label: 'Daily Tasks', screen: 'DailyTasksForm' },
    { icon: 'chart-line', label: 'Competition Form', screen: 'CompetitionReportForm' },
    { icon: 'calendar-remove', label: 'Apply For Leave', screen: 'LeaveApplicationForm' },
  ];

  // FIX: This function is the core change. It now navigates to the nested stack.
  const handleNavigation = (screen: string) => {
    props.navigation.navigate('Root', { screen: screen });
  };

  const handleLogout = () => {
    Alert.alert(
      'Neural Disconnect',
      'Terminate consciousness interface and return to standby mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            Alert.alert('System', 'Neural link terminated successfully.');
            // TODO: Implement actual logout logic here
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile */}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.screen}
              icon={item.icon}
              label={item.label}
              onPress={() => handleNavigation(item.screen)}
              theme={theme}
            />
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.logoutContent, { borderColor: theme.colors.error, backgroundColor: theme.colors.surface }]}>
              <Icon name="power" size={20} color={theme.colors.error} />
              <Text style={[styles.logoutText, { color: theme.colors.error }]}>LOG OUT</Text>
            </View>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  profileContainer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userRole: {
    fontSize: 13,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  userCompany: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  menuContainer: {
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.3,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  logoutContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  logoutButton: {
    borderRadius: 12,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});