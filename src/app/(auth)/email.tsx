import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { authErrorMessage } from '@/features/auth/auth-error';
import { setEntryDone } from '@/features/onboarding/use-onboarding';
import { getAuthRedirectUrl, supabase } from '@/lib/supabase';
import { Fonts } from '@/theme';

const inputClass =
  'h-12 rounded-[2px] border border-ink bg-paper px-3 text-ink dark:border-paper-dark dark:bg-night-element dark:text-paper-dark';
const labelClass = 'text-[10px] font-bold uppercase text-ink dark:text-paper-dark';

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
        const { data, error: e } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: getAuthRedirectUrl() },
        });
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
      setError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    setError(null);
    setLoading(true);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: getAuthRedirectUrl() },
    });
    setLoading(false);
    if (resendError) {
      setError(authErrorMessage(resendError));
      return;
    }
    setInfo('Новое письмо отправлено. Используйте только последнюю ссылку.');
  };

  return (
    <View className="flex-1 gap-3 bg-paper px-6 py-8 dark:bg-night">
      <View className="gap-2">
        <Text style={{ fontFamily: Fonts.mono }} className={labelClass}>
          Email
        </Text>
        <TextInput
          className={inputClass}
          style={{ fontFamily: Fonts.mono }}
          placeholder="name@example.com"
          placeholderTextColor="#6B6560"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View className="gap-2">
        <Text style={{ fontFamily: Fonts.mono }} className={labelClass}>
          Пароль
        </Text>
        <TextInput
          className={inputClass}
          style={{ fontFamily: Fonts.mono }}
          placeholder="Минимум 6 символов"
          placeholderTextColor="#6B6560"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      {error ? (
        <Text style={{ fontFamily: Fonts.mono }} className="text-xs text-accent">
          {error}
        </Text>
      ) : null}
      {info ? (
        <View className="gap-2">
          <Text style={{ fontFamily: Fonts.mono }} className="text-xs text-ink dark:text-paper-dark">
            {info}
          </Text>
          <Button
            label="Отправить письмо повторно"
            variant="outline"
            loading={loading}
            disabled={!email}
            onPress={resendConfirmation}
          />
        </View>
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
