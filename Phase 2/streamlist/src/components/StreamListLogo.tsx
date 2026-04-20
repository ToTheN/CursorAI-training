import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const STREAMLIST_APP_DISPLAY_NAME: string = 'Streamlist';
const movieIconSize: number = spacing.xl - 6;

export interface StreamListLogoProps {
  /** When true, uses slightly smaller title for dense layouts */
  compact?: boolean;
}

export function StreamListLogo(props: StreamListLogoProps) {
  const { compact = false } = props;
  return (
    <View style={styles.leading}>
      <MaterialIcons
        name="movie-filter"
        size={movieIconSize}
        color={colors.primary_container}
        accessibilityLabel="Movies"
      />
      <Text
        style={compact ? styles.titleCompact : styles.title}
        numberOfLines={1}
      >
        {STREAMLIST_APP_DISPLAY_NAME}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.textStyle.titleLg,
    fontSize: typography.textStyle.titleLg.fontSize + 6,
    lineHeight: typography.textStyle.titleLg.lineHeight + 2,
    color: colors.on_surface,
  },
  titleCompact: {
    ...typography.textStyle.titleLg,
    color: colors.on_surface,
  },
});
