import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { StreamListLogo } from './StreamListLogo.tsx';

/**
 * Drives user-facing copy. Use `empty` when the API succeeded but returned no usable data.
 */
export type ScreenErrorReason = 'network' | 'empty' | 'generic';

const MESSAGE_BY_REASON: Record<ScreenErrorReason, string> = {
  network: 'Please check your internet connection.',
  empty: 'We are unable to fetch right now.',
  generic: 'Something went wrong.',
};

const TRY_AGAIN_LABEL: string = 'Try Again';

export interface ScreenErrorFallbackProps {
  onTryAgain: () => void;
  reason: ScreenErrorReason;
  /** When false, hides the StreamList logo (e.g. compact inline banner). */
  showLogo?: boolean;
  /** `fullscreen` fills available space (default). `compact` for embedding in a scroll area. */
  layout?: 'fullscreen' | 'compact';
  style?: StyleProp<ViewStyle>;
}

export function ScreenErrorFallback(props: ScreenErrorFallbackProps) {
  const { onTryAgain, reason, showLogo = true, layout = 'fullscreen', style } = props;
  const messageText: string = MESSAGE_BY_REASON[reason];
  const rootStyle: StyleProp<ViewStyle> = [
    styles.rootBase,
    layout === 'fullscreen' ? styles.rootFullscreen : styles.rootCompact,
    style,
  ];
  return (
    <View style={rootStyle}>
      {showLogo ? <StreamListLogo /> : null}
      <Text style={styles.message}>{messageText}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={TRY_AGAIN_LABEL}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onTryAgain}
      >
        <Text style={styles.buttonLabel}>{TRY_AGAIN_LABEL}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rootBase: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  rootFullscreen: {
    flex: 1,
  },
  rootCompact: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'stretch',
    paddingVertical: spacing.md,
  },
  message: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container_highest,
  },
  buttonPressed: {
    backgroundColor: colors.surface_bright,
  },
  buttonLabel: {
    ...typography.textStyle.titleSm,
    color: colors.primary_container,
  },
});
