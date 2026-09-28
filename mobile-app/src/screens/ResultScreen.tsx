import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, Body, PrimaryButton } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useTrainingFlow } from '../ar/TrainingFlowContext';
import { useSession } from '../session/SessionContext';
import { trySyncNow } from '../storage/syncManager';
import * as LocalStore from '../storage/localStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ navigation }: Props) {
  const { t } = useLocalization();
  const { lastResult, lastAttempt } = useTrainingFlow();
  const { issueCertificateForAttempt } = useSession();
  const [issuing, setIssuing] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');

  if (!lastResult || !lastAttempt) return null;

  const currentAttempt = lastAttempt;

  async function handleGetCertificate() {
    setIssuing(true);
    setPendingMessage('');

    // The attempt may still be mid-sync; retry briefly rather than failing outright.
    for (let attempt = 0; attempt < 5; attempt++) {
      await trySyncNow();
      const attempts = await LocalStore.loadAttempts();
      const synced = attempts.find((a) => a.clientAttemptId === currentAttempt.clientAttemptId);
      if (synced?.serverAttemptId) {
        const cert = await issueCertificateForAttempt(synced);
        if (cert) {
          setIssuing(false);
          navigation.replace('Certificate');
          return;
        }
      }
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
    }

    setIssuing(false);
    setPendingMessage(t('certificate_pending_sync'));
  }

  return (
    <Screen>
      <Title>{t(lastResult.passed ? 'passed_label' : 'failed_label')}</Title>
      <Body>
        {t('score_label')}: {lastResult.score}/{lastResult.maxScore} ({lastResult.percentage}%)
      </Body>
      {!lastResult.passed && <Body>{t('retrain_recommendation')}</Body>}
      {lastResult.passed && (
        <PrimaryButton label={issuing ? '...' : t('get_certificate')} onPress={handleGetCertificate} disabled={issuing} />
      )}
      {!!pendingMessage && <Body>{pendingMessage}</Body>}
      <PrimaryButton label={t('home_title')} onPress={() => navigation.popToTop()} />
    </Screen>
  );
}
