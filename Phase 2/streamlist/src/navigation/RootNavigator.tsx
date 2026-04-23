import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DefaultTheme,
  NavigationContainer,
  type NavigationContainerRefWithCurrent,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DetailScreen } from '../screens/DetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SeeAllScreen } from '../screens/SeeAllScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { useWatchlistStore } from '../store/watchlistStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Solid tab bar background only. BlurView was removed: on Android it can interact badly
 * with react-native-screens native stack (dimmed overlay on pushed screens) while the
 * visual was already covered by an opaque scrim.
 */
function TabBarBackground() {
  return <View style={styles.tabBarBackgroundRoot} />;
}

function renderTabBarBackground() {
  return <TabBarBackground />;
}

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surface,
    card: colors.surface,
    text: colors.on_surface,
    primary: colors.primary,
  },
};

const TAB_ICON_SCALE_FOCUSED = 1.12;
const TAB_ICON_SCALE_IDLE = 1;

interface TabBarAnimatedIconProps {
  focused: boolean;
  children: React.ReactElement;
}

function TabBarAnimatedIcon(props: TabBarAnimatedIconProps) {
  const { focused, children } = props;
  const scale = useRef(
    new Animated.Value(focused ? TAB_ICON_SCALE_FOCUSED : TAB_ICON_SCALE_IDLE),
  ).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? TAB_ICON_SCALE_FOCUSED : TAB_ICON_SCALE_IDLE,
      friction: 7,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);
  return (
    <Animated.View style={[styles.tabBarIconWrap, { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

const homeTabBarIcon: NonNullable<BottomTabNavigationOptions['tabBarIcon']> = ({
  color,
  size,
  focused,
}) => (
  <TabBarAnimatedIcon focused={focused}>
    <Ionicons name={focused ? 'home' : 'home'} size={size} color={color} />
  </TabBarAnimatedIcon>
);

const searchTabBarIcon: NonNullable<BottomTabNavigationOptions['tabBarIcon']> = ({
  color,
  size,
  focused,
}) => (
  <TabBarAnimatedIcon focused={focused}>
    <Ionicons
      name={focused ? 'search' : 'search-outline'}
      size={size}
      color={color}
    />
  </TabBarAnimatedIcon>
);

const WATCHLIST_TAB_BADGE_MAX = 99;

interface WatchlistTabBarIconProps {
  color: string;
  focused: boolean;
  size: number;
}

function WatchlistTabBarIcon(props: WatchlistTabBarIconProps) {
  const { color, focused, size } = props;
  const unseenCount: number = useWatchlistStore(
    (state) => Math.max(0, state.entries.length - state.acknowledgedCount),
  );
  const showBadge: boolean = !focused && unseenCount > 0;
  const badgeLabel: string =
    unseenCount > WATCHLIST_TAB_BADGE_MAX
      ? `${WATCHLIST_TAB_BADGE_MAX}+`
      : String(unseenCount);
  return (
    <TabBarAnimatedIcon focused={focused}>
      <View style={styles.watchlistIconContainer}>
        <Ionicons name="bookmark" size={size} color={color} />
        {showBadge ? (
          <View style={styles.watchlistTabBadge}>
            <Text numberOfLines={1} style={styles.watchlistTabBadgeText}>
              {badgeLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </TabBarAnimatedIcon>
  );
}

const watchlistTabBarIcon: NonNullable<BottomTabNavigationOptions['tabBarIcon']> = ({
  color,
  size,
  focused,
}): React.ReactNode => (
  <WatchlistTabBarIcon
    color={String(color)}
    size={size}
    focused={focused}
  />
);

const profileTabBarIcon: NonNullable<BottomTabNavigationOptions['tabBarIcon']> = ({
  color,
  size,
  focused,
}) => (
  <TabBarAnimatedIcon focused={focused}>
    <Ionicons
      name={focused ? 'person' : 'person'}
      size={size}
      color={color}
    />
  </TabBarAnimatedIcon>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarBackground: renderTabBarBackground,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary_container,
        tabBarInactiveTintColor: colors.outline_secondaryvariant,
        tabBarLabelStyle: {
          textTransform: 'uppercase',
          fontFamily: typography.fontFamily.interSemiBold,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: homeTabBarIcon }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: searchTabBarIcon }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{ tabBarIcon: watchlistTabBarIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: profileTabBarIcon }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{
          gestureEnabled: false,
          contentStyle: { backgroundColor: colors.surface_container },
        }}
      />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ freezeOnBlur: false }}
      />
      <Stack.Screen
        name="SeeAll"
        component={SeeAllScreen}
        options={{ freezeOnBlur: false }}
      />
    </Stack.Navigator>
  );
}

export interface RootNavigatorProps {
  navigationRef?: NavigationContainerRefWithCurrent<RootStackParamList>;
  onNavigationReady?: () => void;
  onNavigationStateChange?: () => void;
}

export function RootNavigator(props: RootNavigatorProps) {
  const { navigationRef, onNavigationReady, onNavigationStateChange } = props;
  return (
    <NavigationContainer<RootStackParamList>
      ref={navigationRef}
      theme={navigationTheme}
      onReady={onNavigationReady}
      onStateChange={onNavigationStateChange}
    >
      <RootStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarBackgroundRoot: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  tabBarIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchlistIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  watchlistTabBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    minWidth: 16,
    minHeight: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.primary_container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchlistTabBadgeText: {
    color: colors.on_surface,
    fontFamily: typography.fontFamily.interSemiBold,
    fontSize: 9,
    lineHeight: 11,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
