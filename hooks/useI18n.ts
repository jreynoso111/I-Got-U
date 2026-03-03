import { translateText } from '@/constants/i18n';
import { useAuthStore } from '@/store/authStore';

export function useI18n() {
  const language = useAuthStore((state) => state.language);

  const t = (text: string) => translateText(text, language);

  return { language, t };
}
