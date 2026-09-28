import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LocalizationProvider } from './src/localization/LocalizationContext';
import { SessionProvider } from './src/session/SessionContext';
import { TrainingFlowProvider } from './src/ar/TrainingFlowContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
      <LocalizationProvider>
        <SessionProvider>
          <TrainingFlowProvider>
            <RootNavigator />
          </TrainingFlowProvider>
        </SessionProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}
