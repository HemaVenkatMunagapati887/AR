import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, Body, COLORS } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { AttemptRecord } from '../types/models';
import * as LocalStore from '../storage/localStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const { t } = useLocalization();
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const list = await LocalStore.loadAttempts();
      setAttempts([...list].reverse());
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <Screen style={{ justifyContent: 'flex-start', paddingTop: 32 }}>
      <Title>{t('history_title')}</Title>
      {attempts.length === 0 && <Body>{t('no_history')}</Body>}
      <FlatList
        data={attempts}
        keyExtractor={(a) => a.clientAttemptId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.module}>{item.moduleId}</Text>
            <Text style={[styles.status, item.passed ? styles.pass : styles.fail]}>
              {item.percentage}% — {t(item.passed ? 'passed_label' : 'failed_label')}
            </Text>
            {item.pendingSync && <Text style={styles.pending}>{t('sync_status_offline')}</Text>}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10 },
  module: { color: COLORS.text, fontWeight: '600', marginBottom: 4 },
  status: { fontSize: 13 },
  pass: { color: COLORS.green },
  fail: { color: COLORS.red },
  pending: { color: '#F59E0B', fontSize: 11, marginTop: 4 },
});
