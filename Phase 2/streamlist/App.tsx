/**
 * @format
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import type { RootStackParamList } from './src/navigation/types';
import { colors } from './src/theme/colors';

const rootNavigationRef = createNavigationContainerRef<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <View style={styles.mainContent}>
        <RootNavigator navigationRef={rootNavigationRef} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});

export default App;
