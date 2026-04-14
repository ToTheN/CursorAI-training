/**
 * @format
 */

import React from 'react';
import { Pressable, StatusBar, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StreamListLogo } from './src/components/StreamListLogo';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';

const notificationIconSize: number = spacing.lg;

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView
        edges={['top']}
        style={styles.safeAreaTop}
      >
        <View
          style={styles.appBar}
          accessibilityRole="header"
        >
          <View style={styles.appBarLeading}>
            <StreamListLogo />
          </View>
          <Pressable
            accessibilityLabel="Notifications"
            accessibilityRole="button"
            hitSlop={spacing.xs}
          >
            <Ionicons
              name="notifications"
              size={notificationIconSize}
              color={colors.on_surface_variant}
            />
          </Pressable>
        </View>
      </SafeAreaView>
      <View style={styles.mainContent}>
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaTop: {
    backgroundColor: colors.surface,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  appBarLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  mainContent: {
    flex: 1,
  },
});

export default App;
