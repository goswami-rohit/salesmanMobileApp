// src/pages/ProfilePage.tsx 
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Text, Divider, List } from 'react-native-paper'; // Updated import
import AppHeader from '../components/AppHeader';

export default function ProfilePage() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Profile" />
      <View style={styles.container}>
        <View style={styles.userInfoSection}>
          <Avatar.Image
            source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
            size={80}
          />
          <View style={{ marginLeft: 20 }}>
            {/* Replaced deprecated Title component */}
            <Text variant="headlineSmall" style={styles.title}>John Doe</Text>
            {/* Replaced deprecated Caption component */}
            <Text variant="bodyMedium" style={styles.caption}>Sales Executive</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <List.Section>
            <List.Item
              title="john.doe@example.com"
              titleStyle={styles.listItemTitle}
              left={() => <List.Icon icon="email-outline" color="#9ca3af" />}
            />
            <List.Item
              title="+91 98765 43210"
              titleStyle={styles.listItemTitle}
              left={() => <List.Icon icon="phone-outline" color="#9ca3af" />}
            />
             <List.Item
              title="Guwahati, Assam"
              titleStyle={styles.listItemTitle}
              left={() => <List.Icon icon="map-marker-outline" color="#9ca3af" />}
            />
        </List.Section>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 16 },
  userInfoSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontWeight: 'bold', color: '#e5e7eb' },
  caption: { color: '#9ca3af' },
  divider: { backgroundColor: '#334155', marginVertical: 10 },
  listItemTitle: { color: '#d1d5db' }
});

