import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { Fonts } from '@/theme';

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
};

export function FormField({ label, hint, multiline, ...props }: FormFieldProps) {
  return (
    <View className="gap-1.5">
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
        className="text-[11px] font-bold uppercase text-ink dark:text-paper-dark"
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        multiline={multiline}
        placeholderTextColor="#8A847C"
        className={`border border-[#BDB5AA] bg-white px-3 text-base text-ink dark:border-[#4A443D] dark:bg-[#1C1916] dark:text-paper-dark ${
          multiline ? 'min-h-24 py-3' : 'h-12'
        }`}
        {...props}
      />
      {hint ? <Text className="text-xs text-[#6B6560] dark:text-[#A39D93]">{hint}</Text> : null}
    </View>
  );
}
