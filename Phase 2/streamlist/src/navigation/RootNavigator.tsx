import { BlurView } from '@react-native-community/blur';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DetailScreen } from '../screens/DetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabBarBackground() {
  return (
    <View style={styles.tabBarBackgroundRoot}>
      <BlurView
        blurAmount={20}
        blurType="dark"
        reducedTransparencyFallbackColor={colors.surface_container}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tabBarOverlay} />
    </View>
  );
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
    border: colors.outline_variant,
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
        tabBarInactiveTintColor: colors.on_surface_variant,
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
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
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
  },
  tabBarOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.surface,
  },
});
