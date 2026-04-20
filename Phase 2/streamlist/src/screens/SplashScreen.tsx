/**
 * @format
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { STREAMLIST_APP_DISPLAY_NAME } from '../components/StreamListLogo';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const SPLASH_ICON_SIZE: number = spacing.xxl + spacing.md;
const SPLASH_NAV_DELAY_MS: number = 1800;
const SLIDE_ENTRANCE_MS: number = 650;
const SLIDE_OFFSET_X: number = spacing.xl + spacing.lg;

export function SplashScreen(): React.ReactElement {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Splash'>>();
  const iconSlideX = useRef(new Animated.Value(-SLIDE_OFFSET_X)).current;
  const titleSlideX = useRef(new Animated.Value(SLIDE_OFFSET_X)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(iconSlideX, {
        toValue: 0,
        duration: SLIDE_ENTRANCE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleSlideX, {
        toValue: 0,
        duration: SLIDE_ENTRANCE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: SLIDE_ENTRANCE_MS - 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [brandOpacity, iconSlideX, titleSlideX]);
  useEffect(() => {
    const timerId = setTimeout(() => {
      navigation.replace('MainTabs');
    }, SPLASH_NAV_DELAY_MS);
    return () => {
      clearTimeout(timerId);
    };
  }, [navigation]);
  return (
    <View style={styles.root} accessibilityLabel="Streamlist splash">
      <Animated.View style={[styles.brandRow, { opacity: brandOpacity }]}>
        <Animated.View
          style={[styles.iconWrap, { transform: [{ translateX: iconSlideX }] }]}
        >
          <MaterialIcons
            name="movie-filter"
            size={SPLASH_ICON_SIZE}
            color={colors.primary_container}
            accessibilityLabel="Movies"
          />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateX: titleSlideX }] }}>
          <Text style={styles.appName} numberOfLines={1}>
            {STREAMLIST_APP_DISPLAY_NAME}
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface_container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    flexShrink: 0,
  },
  appName: {
    ...typography.textStyle.displayMd,
    color: colors.on_surface,
    textAlign: 'left',
  },
});
