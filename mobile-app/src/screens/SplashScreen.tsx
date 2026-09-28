import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, COLORS } from '../components/ui';
import { useLocalization, loadPersistedLanguage } from '../localization/LocalizationContext';
import * as LocalStore from '../storage/localStorage';
import { startBackgroundSync } from '../storage/syncManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { setLanguage } = useLocalization();

  useEffect(() => {
    (async () => {
      startBackgroundSync();

      const persistedLang = await loadPersistedLanguage();
      if (persistedLang) setLanguage(persistedLang);

      const profile = await LocalStore.loadProfile();
      navigation.replace(profile ? 'Home' : 'LanguageSelect');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <Title>Safety Trainer</Title>
      <ActivityIndicator color={COLORS.orange} size="large" />
    </Screen>
  );
}
