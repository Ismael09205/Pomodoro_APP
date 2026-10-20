import AsyncStorage from '@react-native-async-storage/async-storage';

import { emptyCycle, type CycleState } from '../domain/cycle';
import type { Timer } from '../domain/timer';

export const CYCLE_STATE_KEY = '@pomodoro/cycle-state';

// v2 (spec 003): se añade el campo `timer` conservando la misma clave y
// leyendo los datos v1 sin perderlos (Decisión 001; Decisión 009; RN-03).
const CURRENT_VERSION = 2;

type StoredCycleState = {
  version: number;
  cycle: CycleState;
  timer?: unknown;
};

export type StoredSession = {
  cycle: CycleState;
  timer: Timer | null;
};

const isValidTimer = (value: unknown): value is Timer => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Timer>;
  return (
    typeof candidate.state === 'string' &&
    typeof candidate.durationMs === 'number' &&
    typeof candidate.remainingMs === 'number'
  );
};

export const loadCycleState = async (): Promise<StoredSession> => {
  try {
    const raw = await AsyncStorage.getItem(CYCLE_STATE_KEY);
    if (raw === null) return { cycle: emptyCycle(), timer: null };
    const parsed = JSON.parse(raw) as StoredCycleState;
    if (!parsed || typeof parsed !== 'object' || !parsed.cycle) {
      return { cycle: emptyCycle(), timer: null };
    }
    // v1 sin `timer` o dato inválido: se conservan fase y pomodoros y el
    // temporizador se reconstruye en Inicial con el tiempo completo (Decisión 009).
    const timer = isValidTimer(parsed.timer) ? parsed.timer : null;
    return { cycle: parsed.cycle, timer };
  } catch {
    return { cycle: emptyCycle(), timer: null };
  }
};

export const saveCycleState = async (
  session: { cycle: CycleState; timer: Timer },
): Promise<void> => {
  const payload: StoredCycleState = {
    version: CURRENT_VERSION,
    cycle: session.cycle,
    timer: session.timer,
  };
  try {
    await AsyncStorage.setItem(CYCLE_STATE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('No se pudo guardar el estado del ciclo.', error);
  }
};
