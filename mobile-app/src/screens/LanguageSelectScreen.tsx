import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, Body, PrimaryButton } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { LanguageCode } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSelect'>;

export default function LanguageSelectScreen({ navigation }: Props) {
  const { t, setLanguage, isDraftLanguage } = useLocalization();

  function select(lang: LanguageCode) {
    setLanguage(lang);
    navigation.replace('Login');
  }

  return (
    <Screen>
      <Title>{t('select_language')}</Title>
      <PrimaryButton label="English" onPress={() => select('en')} />
      <PrimaryButton label="हिन्दी (Hindi)" onPress={() => select('hi')} />
      <PrimaryButton label="Santali (Draft)" onPress={() => select('sat')} />
      {isDraftLanguage('sat') && <Body>{t('santali_draft_notice')}</Body>}
    </Screen>
  );
}
