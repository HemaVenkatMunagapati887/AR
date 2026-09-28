import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Title, Body, PrimaryButton, COLORS } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useSession } from '../session/SessionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { t } = useLocalization();
  const { login } = useSession();
  const [workerId, setWorkerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');
    const result = await login(workerId, password);
    setLoading(false);
    if (result.ok) {
      navigation.replace('Home');
    } else {
      setError(t('login_error'));
    }
  }

  return (
    <Screen>
      <Title>{t('login_title')}</Title>
      <TextInput
        style={styles.input}
        placeholder={t('worker_id_label')}
        placeholderTextColor={COLORS.muted}
        autoCapitalize="characters"
        value={workerId}
        onChangeText={setWorkerId}
      />
      <TextInput
        style={styles.input}
        placeholder={t('password_label')}
        placeholderTextColor={COLORS.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {!!error && <Body>{error}</Body>}
      <PrimaryButton label={loading ? '...' : t('login_button')} onPress={handleLogin} disabled={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
});
