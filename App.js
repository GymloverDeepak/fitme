import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ErrorBoundary from './src/components/ErrorBoundary';
import LoadingState from './src/components/LoadingState';
import AppNavigator from './src/navigation/AppNavigator';
import { AppStateProvider, useAppState } from './src/storage/AppStateContext';
import { colors } from './src/theme';

// Keep the native splash screen up until saved data has loaded, so users never see a blank flash.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { isReady } = useAppState();

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync().catch(() => {});
  }, [isReady]);

  if (!isReady) return <LoadingState />;
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.root}>
      <ErrorBoundary>
        <AppStateProvider>
          <AppContent />
        </AppStateProvider>
      </ErrorBoundary>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
