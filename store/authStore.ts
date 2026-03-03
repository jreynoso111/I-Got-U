import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { AppLanguage } from '@/constants/i18n';

interface AuthState {
    session: Session | null;
    user: User | null;
    role: string | null;
    language: AppLanguage;
    initialized: boolean;
    setSession: (session: Session | null) => void;
    setUser: (user: User | null) => void;
    setRole: (role: string | null) => void;
    setLanguage: (language: AppLanguage) => void;
    setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    role: null,
    language: 'en',
    initialized: false,
    setSession: (session) => set({ session }),
    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),
    setLanguage: (language) => set({ language }),
    setInitialized: (initialized) => set({ initialized }),
}));
