import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ViroARSceneNavigator, isARSupportedOnDevice, requestRequiredPermissions } from '@reactvision/react-viro';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, Body, PrimaryButton, COLORS } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useTrainingFlow, TrainingPhase } from '../ar/TrainingFlowContext';
import { ARTrainingScene } from '../ar/ARTrainingScene';
import { AssessmentOverlay } from '../assessment/AssessmentOverlay';

type Props = NativeStackScreenProps<RootStackParamList, 'ArExperience'>;

type Readiness = 'checking' | 'unsupported' | 'permission_denied' | 'native_module_missing' | 'init_error' | 'ready';

export default function ArExperienceScreen({ navigation }: Props) {
  const { t } = useLocalization();
  const { phase, goToPhase } = useTrainingFlow();
  const [readiness, setReadiness] = useState<Readiness>('checking');

  useEffect(() => {
    (async () => {
      // Defensive AR bring-up: the native Viro module can be absent from a
      // given build (wrong architecture, a broken native build, an
      // unlinked package) even though the JS import itself resolves — in
      // that case isARSupportedOnDevice/requestRequiredPermissions are
      // undefined rather than throwing, so an unguarded call produces an
      // unhandled promise rejection instead of a usable error state.
      if (typeof isARSupportedOnDevice !== 'function' || typeof requestRequiredPermissions !== 'function') {
        console.warn('[ArExperienceScreen] react-viro native module is not available (isARSupportedOnDevice/requestRequiredPermissions undefined).');
        setReadiness('native_module_missing');
        return;
      }

      try {
        const support = await isARSupportedOnDevice();
        if (!support?.isARSupported) {
          setReadiness('unsupported');
          return;
        }
        const perms = await requestRequiredPermissions(['camera']);
        setReadiness(perms?.camera ? 'ready' : 'permission_denied');
      } catch (err) {
        console.warn('[ArExperienceScreen] AR initialization failed:', err);
        setReadiness('init_error');
      }
    })();
  }, []);

  function handleCalibrationContinue() {
    goToPhase(TrainingPhase.GuidedPractice);
  }

  function handlePracticeContinue() {
    if (phase === TrainingPhase.GuidedPractice) {
      goToPhase(TrainingPhase.IndependentPractice);
    } else if (phase === TrainingPhase.IndependentPractice) {
      goToPhase(TrainingPhase.Assessment);
    }
  }

  if (readiness === 'checking') {
    return (
      <Screen>
        <ActivityIndicator color={COLORS.orange} size="large" />
      </Screen>
    );
  }

  if (readiness === 'unsupported') {
    return (
      <Screen>
        <Title>{t('no_ar_support_title')}</Title>
        <Body>{t('no_ar_support_body')}</Body>
        <PrimaryButton label={t('continue')} onPress={handleCalibrationContinue} />
      </Screen>
    );
  }

  if (readiness === 'permission_denied') {
    return (
      <Screen>
        <Title>{t('camera_permission_title')}</Title>
        <Body>{t('camera_permission_body')}</Body>
      </Screen>
    );
  }

  if (readiness === 'native_module_missing' || readiness === 'init_error') {
    return (
      <Screen>
        <Title>{t('no_ar_support_title')}</Title>
        <Body>{t('ar_module_missing_body')}</Body>
        <PrimaryButton label={t('continue')} onPress={handleCalibrationContinue} />
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator autofocus initialScene={{ scene: ARTrainingScene }} style={styles.arView} />

      <View style={styles.overlay} pointerEvents="box-none">
        {phase === TrainingPhase.ArCalibration && (
          <View style={styles.card}>
            <Body>{t('ar_calibration_instruction')}</Body>
            <PrimaryButton label={t('continue')} onPress={handleCalibrationContinue} />
          </View>
        )}

        {(phase === TrainingPhase.GuidedPractice || phase === TrainingPhase.IndependentPractice) && (
          <View style={styles.card}>
            <Body>{t(phase === TrainingPhase.GuidedPractice ? 'guided_practice_title' : 'independent_practice_title')}</Body>
            <PrimaryButton label={t('continue')} onPress={handlePracticeContinue} />
          </View>
        )}

        {phase === TrainingPhase.Assessment && <AssessmentOverlay navigation={navigation} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  arView: { flex: 1 },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  card: { backgroundColor: 'rgba(17,24,39,0.92)', borderRadius: 16, padding: 18 },
});
