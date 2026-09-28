import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, Body, PrimaryButton, SecondaryButton } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useTrainingFlow, TrainingPhase } from '../ar/TrainingFlowContext';

type Props = NativeStackScreenProps<RootStackParamList, 'LearningContent'>;

// PHASE 1 (Introduction) + PHASE 2 (concept teaching) from the brief — the
// worker must read this before any AR practice begins.
export default function LearningContentScreen({ navigation }: Props) {
  const { t } = useLocalization();
  const { module, goToPhase } = useTrainingFlow();
  const [index, setIndex] = useState(0);

  if (!module) return null;

  const slideKeys =
    module.moduleId === 'gas-confined-space'
      ? ['gas_learn_slide_1', 'gas_learn_slide_2', 'gas_learn_slide_3']
      : ['fire_learn_slide_1', 'fire_learn_slide_2', 'fire_learn_slide_3'];

  function handleNext() {
    if (index < slideKeys.length - 1) {
      setIndex(index + 1);
    } else {
      goToPhase(TrainingPhase.ArCalibration);
      navigation.navigate('ArExperience');
    }
  }

  return (
    <Screen>
      <Title>{t('learn_phase_title')}</Title>
      <Body>{t(slideKeys[index])}</Body>
      <PrimaryButton label={index < slideKeys.length - 1 ? t('next') : t('continue')} onPress={handleNext} />
      {index > 0 && <SecondaryButton label={t('back')} onPress={() => setIndex(index - 1)} />}
    </Screen>
  );
}
