import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'gemini' | 'claude' | 'perplexity';

interface ModelOption {
  value: string;
  label: string;
  description?: string;
}

// Provider-specific model configurations
export const PROVIDER_MODELS: Record<AIProvider, ModelOption[]> = {
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Latest & Fast (Recommended)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Fast & Efficient' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Most Capable' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', description: 'Experimental' },
  ],
  claude: [
    { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5', description: 'Latest & Most Capable (Recommended)' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', description: 'Balanced Performance' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', description: 'Fast & Efficient' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', description: 'Previous Generation' },
  ],
  perplexity: [
    { value: 'llama-3.1-sonar-large-128k-online', label: 'Sonar Large Online', description: 'With Web Search (Recommended)' },
    { value: 'llama-3.1-sonar-small-128k-online', label: 'Sonar Small Online', description: 'Fast with Web Search' },
    { value: 'llama-3.1-sonar-huge-128k-online', label: 'Sonar Huge Online', description: 'Most Capable with Web Search' },
    { value: 'llama-3.1-sonar-large-128k-chat', label: 'Sonar Large Chat', description: 'Chat Only' },
    { value: 'llama-3.1-sonar-small-128k-chat', label: 'Sonar Small Chat', description: 'Fast Chat Only' },
  ],
};

// Default models for each provider
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: 'gemini-2.5-flash',
  claude: 'claude-sonnet-4-5-20250929',
  perplexity: 'llama-3.1-sonar-large-128k-online',
};

interface SettingsState {
  provider: AIProvider;
  apiKey: string;
  model: string;
  theme: 'light' | 'dark';
  setProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-2.5-flash',
      theme: 'light',

      setProvider: (provider: AIProvider) =>
        set((state) => {
          // When provider changes, update model to the default for that provider
          // unless the current model is already valid for the new provider
          const currentModelValid = PROVIDER_MODELS[provider].some(
            (m) => m.value === state.model
          );
          return {
            provider,
            model: currentModelValid ? state.model : DEFAULT_MODELS[provider],
          };
        }),
      setApiKey: (key: string) => set({ apiKey: key }),
      setModel: (model: string) => set({ model }),
      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'arbor-settings',
    }
  )
);
