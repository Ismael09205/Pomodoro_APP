import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, type PomodoroSettings } from '../domain/settings';

export const SETTINGS_KEY = '@pomodoro/settings';

// Clave nueva de la spec 005, versionada como las existentes; no se tocan
// @pomodoro/cycle-state ni @pomodoro/study-record (Constitución 5).
const CURRENT_VERSION = 1;

type StoredSettings = PomodoroSettings & { version: number };

const isValidSettings = (value: unknown): value is PomodoroSettings => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PomodoroSettings>;
  return (
    typeof candidate.studyMinutes === 'number' &&
    Number.isFinite(candidate.studyMinutes) &&
    typeof candidate.shortBreakMinutes === 'number' &&
    Number.isFinite(candidate.shortBreakMinutes) &&
    typeof candidate.longBreakMinutes === 'number' &&
    Number.isFinite(candidate.longBreakMinutes) &&
    typeof candidate.pomodorosPerCycle === 'number' &&
    Number.isFinite(candidate.pomodorosPerCycle)
  );
};

/**
 * Carga los ajustes al montar la app (RF-03). Ante clave ausente o dato
 * inválido devuelve DEFAULT_SETTINGS sin lanzar; solo AsyncStorage local
 * (RNF-01).
 */
export const loadSettings = async (): Promise<PomodoroSettings> => {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw === null) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSettings(parsed)) return DEFAULT_SETTINGS;
    return {
      studyMinutes: parsed.studyMinutes,
      shortBreakMinutes: parsed.shortBreakMinutes,
      longBreakMinutes: parsed.longBreakMinutes,
      pomodorosPerCycle: parsed.pomodorosPerCycle,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/**
 * Guarda los 4 ajustes únicamente al pulsar "Guardar" con el formulario
 * válido (RF-02, RF-10; Decisión 008).
 */
export const saveSettings = async (settings: PomodoroSettings): Promise<void> => {
  const payload: StoredSettings = { version: CURRENT_VERSION, ...settings };
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('No se pudieron guardar los ajustes.', error);
  }
};
