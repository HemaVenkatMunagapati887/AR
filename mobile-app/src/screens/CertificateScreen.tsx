import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, PrimaryButton, COLORS } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useSession } from '../session/SessionContext';
import { useTrainingFlow } from '../ar/TrainingFlowContext';
import { localize } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Certificate'>;

export default function CertificateScreen({ navigation }: Props) {
  const { t, language } = useLocalization();
  const { worker, lastIssuedCertificate } = useSession();
  const { module } = useTrainingFlow();

  if (!lastIssuedCertificate) return null;

  return (
    <Screen>
      <Title>{t('certificate_title')}</Title>
      <View style={styles.row}>
        <Text style={styles.label}>{t('certificate_worker_label')}</Text>
        <Text style={styles.value}>{worker?.name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('certificate_module_label')}</Text>
        <Text style={styles.value}>{module ? localize(module.name, language) : lastIssuedCertificate.moduleId}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('certificate_score_label')}</Text>
        <Text style={styles.value}>{lastIssuedCertificate.percentage}%</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('certificate_date_label')}</Text>
        <Text style={styles.value}>{new Date(lastIssuedCertificate.issuedAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('certificate_id_label')}</Text>
        <Text style={styles.value}>{lastIssuedCertificate.certificateId}</Text>
      </View>
      <PrimaryButton label={t('view_qr')} onPress={() => navigation.navigate('CertificateQr')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: COLORS.muted, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
});
