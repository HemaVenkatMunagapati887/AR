import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Body, COLORS } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useSession } from '../session/SessionContext';
import * as Api from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'CertificateQr'>;

// Displays the QR image generated server-side (backend/src/utils/qr.js) — the
// QR payload is a verification URL keyed only by certificateId, with no
// worker PII embedded, per the certification requirements.
export default function CertificateQrScreen({}: Props) {
  const { t } = useLocalization();
  const { worker, lastIssuedCertificate } = useSession();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!worker || !lastIssuedCertificate) return;
      try {
        const { qrDataUrl: url } = await Api.getCertificate(lastIssuedCertificate.certificateId, worker.authToken);
        setQrDataUrl(url);
      } catch {
        setQrDataUrl(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [worker, lastIssuedCertificate]);

  return (
    <Screen>
      {loading && <ActivityIndicator color={COLORS.orange} size="large" />}
      {!loading && qrDataUrl && (
        <>
          <Image source={{ uri: qrDataUrl }} style={styles.qr} resizeMode="contain" />
          <Body>{t('scan_to_verify')}</Body>
        </>
      )}
      {!loading && !qrDataUrl && <Body>{t('certificate_pending_sync')}</Body>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  qr: { width: 260, height: 260, alignSelf: 'center', marginBottom: 16, backgroundColor: '#fff', borderRadius: 12 },
});
