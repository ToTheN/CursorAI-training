import React, { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

const SHIMMER_HALF_MS: number = 750;

export interface ShimmerPlaceholderProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Pulsing placeholder that cycles between surface_container_high and surface_bright (~1.5s loop).
 */
export function ShimmerPlaceholder(props: ShimmerPlaceholderProps) {
  const { style } = props;
  const progress = useRef<Animated.Value>(new Animated.Value(0)).current;
  useEffect(() => {
    const loop: Animated.CompositeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: SHIMMER_HALF_MS,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: SHIMMER_HALF_MS,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return (): void => {
      loop.stop();
    };
  }, [progress]);
  const backgroundColor: Animated.AnimatedInterpolation<string> = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface_container_high, colors.surface_bright],
  });
  return (
    <Animated.View
      style={[style, { backgroundColor }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
