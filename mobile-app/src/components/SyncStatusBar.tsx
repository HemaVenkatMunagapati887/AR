import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as SyncManager from '../storage/syncManager';
import { useLocalization } from '../localization/LocalizationContext';
import { COLORS } from './ui';

export function SyncStatusBar() {
  const { t } = useLocalization();
  const [status, setStatus] = useState(SyncManager.getStatus());

  useEffect(() => {
    return SyncManager.subscribe(() => setStatus(SyncManager.getStatus()));
  }, []);

  const label = status.pendingCount > 0 ? t('sync_pending_count', status.pendingCount) : t(status.isOnline ? 'sync_status_online' : 'sync_status_offline');

  return (
    <View style={[styles.bar, status.isOnline ? styles.online : styles.offline]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingVertical: 6, borderRadius: 8, marginBottom: 12, alignItems: 'center' },
  online: { backgroundColor: '#14532D' },
  offline: { backgroundColor: '#7C2D12' },
  text: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
});
