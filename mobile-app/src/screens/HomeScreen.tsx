import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, PrimaryButton, SecondaryButton, COLORS } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useSession } from '../session/SessionContext';
import { useTrainingFlow } from '../ar/TrainingFlowContext';
import { ModuleData, localize } from '../types/models';
import * as LocalStore from '../storage/localStorage';
import { SyncStatusBar } from '../components/SyncStatusBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { t, language } = useLocalization();
  const { worker, loadModules, selectModuleForTraining, logout } = useSession();
  const { begin } = useTrainingFlow();
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [passedModuleIds, setPassedModuleIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    const list = await loadModules();
    setModules(list);
    const attempts = await LocalStore.loadAttempts();
    setPassedModuleIds(new Set(attempts.filter((a) => a.passed).map((a) => a.moduleId)));
  }, [loadModules]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refresh);
    return unsubscribe;
  }, [navigation, refresh]);

  async function openModule(moduleId: string) {
    const module = await selectModuleForTraining(moduleId);
    if (module) {
      begin(module);
      navigation.navigate('ModuleIntro', { moduleId });
    }
  }

  return (
    <Screen style={{ justifyContent: 'flex-start', paddingTop: 32 }}>
      <SyncStatusBar />
      <Title>{t('home_title')}</Title>
      <Text style={styles.welcome}>{worker?.name}</Text>

      <FlatList
        data={modules}
        keyExtractor={(m) => m.moduleId}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => {
          const passed = passedModuleIds.has(item.moduleId);
          return (
            <Pressable style={styles.card} onPress={() => openModule(item.moduleId)}>
              <Text style={styles.cardTitle}>{localize(item.name, language)}</Text>
              <Text style={[styles.cardStatus, passed && styles.cardStatusPassed]}>
                {t(passed ? 'completed_modules' : 'pending_training')}
              </Text>
            </Pressable>
          );
        }}
      />

      <PrimaryButton label={t('history_title')} onPress={() => navigation.navigate('History')} />
      <SecondaryButton label={t('logout')} onPress={() => logout().then(() => navigation.replace('LanguageSelect'))} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: { color: COLORS.muted, textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 18, marginBottom: 12 },
  cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  cardStatus: { color: '#F59E0B', marginTop: 6 },
  cardStatusPassed: { color: COLORS.green },
});
