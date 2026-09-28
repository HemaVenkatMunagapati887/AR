import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, Body, PrimaryButton } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useTrainingFlow, TrainingPhase } from '../ar/TrainingFlowContext';
import { localize } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'ModuleIntro'>;

export default function ModuleIntroScreen({ navigation }: Props) {
  const { t, language } = useLocalization();
  const { module, goToPhase } = useTrainingFlow();

  if (!module) return null;

  function handleStart() {
    goToPhase(TrainingPhase.Learning);
    navigation.navigate('LearningContent');
  }

  return (
    <Screen>
      <Title>{localize(module.name, language)}</Title>
      <Body>{localize(module.description, language)}</Body>
      <PrimaryButton label={t('start_training')} onPress={handleStart} />
    </Screen>
  );
}
