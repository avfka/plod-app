import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { setEntryDone } from '@/features/onboarding/use-onboarding';
import { supabase } from '@/lib/supabase';
import { Fonts } from '@/theme';

const inputClass =
  'h-12 rounded-[4px] border border-ink bg-paper px-3 text-ink dark:border-paper-dark dark:bg-night-element dark:text-paper-dark';

export default function EmailAuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        await setEntryDone();
        router.replace('/(onboarding)/step1');
      } else {
        const { data, error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        if (data.session) {
          await setEntryDone();
          router.replace('/(onboarding)/step1');
        } else {
          setInfo('Подтвердите email по ссылке из письма, затем войдите.');
          setMode('signin');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не получилось, попробуйте ещё раз');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 gap-3 bg-paper px-6 py-8 dark:bg-night">
      <TextInput
        className={inputClass}
        style={{ fontFamily: Fonts.mono }}
        placeholder="email"
        placeholderTextColor="#8A847C"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className={inputClass}
        style={{ fontFamily: Fonts.mono }}
        placeholder="пароль"
        placeholderTextColor="#8A847C"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? (
        <Text style={{ fontFamily: Fonts.mono }} className="text-xs text-accent">
          {error}
        </Text>
      ) : null}
      {info ? (
        <Text style={{ fontFamily: Fonts.mono }} className="text-xs text-ink dark:text-paper-dark">
          {info}
        </Text>
      ) : null}
      <Button
        label={mode === 'signin' ? 'Войти' : 'Зарегистрироваться'}
        loading={loading}
        disabled={!email || password.length < 6}
        onPress={submit}
      />
      <Button
        label={mode === 'signin' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
        variant="ghost"
        onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      />
    </View>
  );
}
