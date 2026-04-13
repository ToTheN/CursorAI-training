import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMovieDetail } from '../hooks/useMovieDetail';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export function DetailScreen({ route }: DetailScreenProps) {
  const { movieId } = route.params;
  useMovieDetail(movieId);
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Text style={styles.meta}>Detail</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  meta: {
    color: colors.on_surface_variant,
    fontFamily: typography.fontFamily.interRegular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
  },
});
