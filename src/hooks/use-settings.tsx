import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { DEFAULT_SETTINGS, type PomodoroSettings } from '../domain/settings';
import {
  loadSettings,
  saveSettings as persistSettings,
} from '../storage/settings';

/**
 * Única fuente en memoria de los ajustes compartida entre Home y Ajustes
 * (RF-02, RF-03, RF-08, RF-10; DT-3). Se carga desde AsyncStorage al montar;
 * mientras carga se exponen los valores por defecto.
 */
export type SettingsContextValue = {
  settings: PomodoroSettings;
  loaded: boolean;
  /** Persiste en @pomodoro/settings y actualiza el estado en memoria. */
  saveSettings: (next: PomodoroSettings) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void loadSettings().then((stored) => {
      if (!active) return;
      setSettings(stored);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const saveSettings = useCallback(async (next: PomodoroSettings) => {
    await persistSettings(next);
    setSettings(next);
  }, []);

  const value = useMemo(
    () => ({ settings, loaded, saveSettings }),
    [settings, loaded, saveSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error('useSettings debe usarse dentro de SettingsProvider.');
  }
  return context;
};
