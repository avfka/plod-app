import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { setEntryDone } from '@/features/onboarding/use-onboarding';
import { supabase } from '@/lib/supabase';
import { Fonts } from '@/theme';

const inputClass =
  'h-12 rounded-[2px] border border-ink bg-paper px-3 text-ink dark:border-paper-dark dark:bg-night-element dark:text-paper-dark';

export default function PhoneAuthScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setError(null);
    setLoading(true);
    const { error: e } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    setLoading(false);
    if (e) {
      // до подключения SMS-провайдера (Twilio и т.п.) Supabase вернёт ошибку
      setError(e.message);
      return;
    }
    setStep('otp');
  };

  const verify = async () => {
    setError(null);
    setLoading(true);
    const { error: e } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: code.trim(),
      type: 'sms',
    });
    setLoading(false);
    if (e) {
      setError(e.message);
      return;
    }
    await setEntryDone();
    router.replace('/(onboarding)/step1');
  };

  return (
    <View className="flex-1 gap-3 bg-paper px-6 py-8 dark:bg-night">
      {step === 'phone' ? (
        <>
          <Text
            style={{ fontFamily: Fonts.mono }}
            className="text-[10px] font-bold uppercase text-ink dark:text-paper-dark"
          >
            Номер телефона
          </Text>
          <TextInput
            className={inputClass}
            style={{ fontFamily: Fonts.mono }}
            placeholder="+7 900 000-00-00"
            placeholderTextColor="#6B6560"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Button
            label="Получить код"
            loading={loading}
            disabled={phone.length < 10}
            onPress={sendCode}
          />
        </>
      ) : (
        <>
          <Text
            style={{ fontFamily: Fonts.mono }}
            className="text-[10px] font-bold uppercase text-ink dark:text-paper-dark"
          >
            Код из SMS
          </Text>
          <TextInput
            className={inputClass}
            style={{ fontFamily: Fonts.mono, letterSpacing: 8 }}
            placeholder="000000"
            placeholderTextColor="#6B6560"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
          <Button
            label="Подтвердить"
            loading={loading}
            disabled={code.length < 6}
            onPress={verify}
          />
          <Button label="Изменить номер" variant="ghost" onPress={() => setStep('phone')} />
        </>
      )}
      {error ? (
        <Text style={{ fontFamily: Fonts.mono }} className="text-xs text-accent">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
