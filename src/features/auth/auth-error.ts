export function authErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) return 'Неверный email или пароль.';
  if (normalized.includes('email not confirmed')) return 'Сначала подтвердите email по ссылке из письма.';
  if (normalized.includes('user already registered')) return 'Аккаунт с таким email уже существует.';
  if (normalized.includes('password should be')) return 'Пароль должен содержать минимум 6 символов.';
  if (normalized.includes('rate limit')) return 'Слишком много попыток. Попробуйте немного позже.';
  if (normalized.includes('email link is invalid') || normalized.includes('otp_expired')) {
    return 'Ссылка подтверждения устарела. Запросите новое письмо.';
  }
  if (normalized.includes('unsupported phone provider')) {
    return 'Вход по телефону временно недоступен. Используйте email.';
  }

  return 'Не удалось выполнить вход. Проверьте соединение и попробуйте снова.';
}
