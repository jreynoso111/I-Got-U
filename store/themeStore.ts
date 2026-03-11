import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_PREFERENCE_KEY = 'theme_preference';
const DEFAULT_THEME_PREFERENCE: ThemePreference = 'light';

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  hydrateThemePreference: () => Promise<void>;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  toggleThemePreference: (currentScheme: 'light' | 'dark') => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: DEFAULT_THEME_PREFERENCE,
  hydrated: false,
  hydrateThemePreference: async () => {
    if (get().hydrated) return;

    try {
      const storedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      set({
        preference: isThemePreference(storedPreference) ? storedPreference : DEFAULT_THEME_PREFERENCE,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
  setThemePreference: async (preference) => {
    set({ preference, hydrated: true });

    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
    } catch {
      // Ignore persistence failures and keep the in-memory preference.
    }
  },
  toggleThemePreference: async (currentScheme) => {
    const nextPreference = currentScheme === 'dark' ? 'light' : 'dark';
    await get().setThemePreference(nextPreference);
  },
}));
