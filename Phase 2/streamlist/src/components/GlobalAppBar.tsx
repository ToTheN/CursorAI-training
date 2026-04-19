/**
 * @format
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StreamListLogo } from './StreamListLogo';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const notificationIconSize: number = spacing.lg;

export function GlobalAppBar(): React.ReactElement {
  return (
    <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
      <View style={styles.appBar} accessibilityRole="header">
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
});
