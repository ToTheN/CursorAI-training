/**
 * @format
 */

import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';
import { typography } from './src/theme/typography';

const APP_NAME_PASCAL: string = 'Streamlist';
const movieIconSize: number = spacing.xl - 6;
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
            <MaterialIcons
              name="movie-filter"
              size={movieIconSize}
              color={colors.primary_container}
              accessibilityLabel="Movies"
            />
            <Text
              style={styles.appBarTitle}
              numberOfLines={1}
            >
              {APP_NAME_PASCAL}
            </Text>
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
    gap: spacing.sm,
  },
  appBarTitle: {
    ...typography.textStyle.titleLg,
    fontSize: typography.textStyle.titleLg.fontSize + 6,
    lineHeight: typography.textStyle.titleLg.lineHeight + 2,
    color: colors.on_surface,
  },
  mainContent: {
    flex: 1,
  },
});

export default App;
