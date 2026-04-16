import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DefaultTheme,
  NavigationContainer,
  type NavigationContainerRefWithCurrent,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DetailScreen } from '../screens/DetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SeeAllScreen } from '../screens/SeeAllScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
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

const homeTabBarIcon: NonNullable<BottomTabNavigationOptions['tabBarIcon']> = ({
  color,
  size,
  focused,
}) => (
  <Ionicons name={focused ? 'home' : 'home'} size={size} color={color} />
);

const searchTabBarIcon: NonNullable<BottomTabNavigationOptions['tabBarIcon']> = ({
  color,
  size,
  focused,
}) => (
  <Ionicons
    name={focused ? 'search' : 'search-outline'}
    size={size}
    color={color}
  />
);

const watchlistTabBarIcon: NonNullable<BottomTabNavigationOptions['tabBarIcon']> = ({
  color,
  size,
  focused,
}) => (
  <Ionicons
    name={focused ? 'bookmark' : 'bookmark'}
    size={size}
    color={color}
  />
);

const profileTabBarIcon: NonNullable<BottomTabNavigationOptions['tabBarIcon']> = ({
  color,
  size,
  focused,
}) => (
  <Ionicons
    name={focused ? 'person' : 'person'}
    size={size}
    color={color}
  />
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
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="SeeAll" component={SeeAllScreen} />
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
});
