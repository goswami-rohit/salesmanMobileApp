import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useNavigation, DrawerActions } from '@react-navigation/native';

type AppHeaderProps = {
  title: string;
};

export default function AppHeader({ title }: AppHeaderProps) {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <Appbar.Header
      style={{ backgroundColor: theme.colors.surface }}
      statusBarHeight={0}
    >
      <Appbar.Action
        icon="menu"
        color={theme.colors.onSurface}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
      <Appbar.Content title={title} titleStyle={styles.title} />
      <Appbar.Action
        icon="bell-outline"
        color={theme.colors.onSurface}
        onPress={() => console.log('Pressed notifications')}
      />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: 'bold',
  },
});