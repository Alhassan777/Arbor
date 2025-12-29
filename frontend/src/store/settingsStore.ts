import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  apiKey: string;
  model: string;
  theme: 'light' | 'dark';
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      model: 'claude-3-5-sonnet-20241022',
      theme: 'light',

      setApiKey: (key: string) => set({ apiKey: key }),
      setModel: (model: string) => set({ model }),
      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'branchchat-settings',
    }
  )
);
