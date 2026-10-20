import { DEFAULT_PHASE_DURATIONS } from './config';

/**
 * Ajustes del estudiante (spec 005, HU-005). Módulo puro: sin React ni
 * AsyncStorage (Constitución 9).
 */

export type PomodoroSettings = {
  studyMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodorosPerCycle: number;
};

export type SettingsField = keyof PomodoroSettings;

/** Texto de cada campo tal como se escribe en la pantalla de ajustes. */
export type SettingsInput = Record<SettingsField, string>;

const MS_PER_MINUTE = 60 * 1000;

/** Derivado de config.ts: única fuente de los valores por defecto (25/5/15/4). */
export const DEFAULT_SETTINGS: PomodoroSettings = {
  studyMinutes: DEFAULT_PHASE_DURATIONS.studyMs / MS_PER_MINUTE,
  shortBreakMinutes: DEFAULT_PHASE_DURATIONS.shortBreakMs / MS_PER_MINUTE,
  longBreakMinutes: DEFAULT_PHASE_DURATIONS.longBreakMs / MS_PER_MINUTE,
  pomodorosPerCycle: DEFAULT_PHASE_DURATIONS.pomodorosPerCycle,
};

/** Duraciones de 1 a 120 minutos; pomodoros por ciclo de 1 a 12 (Decisión 001). */
export const SETTINGS_RANGES: Record<SettingsField, { min: number; max: number }> = {
  studyMinutes: { min: 1, max: 120 },
  shortBreakMinutes: { min: 1, max: 120 },
  longBreakMinutes: { min: 1, max: 120 },
  pomodorosPerCycle: { min: 1, max: 12 },
};

export type SettingsFieldValidation = {
  valid: boolean;
  message?: string;
};

const rangeMessage = (field: SettingsField): string => {
  const { min, max } = SETTINGS_RANGES[field];
  return `Ingresa un número entre ${min} y ${max}`;
};

/**
 * Inválido si está vacío, no es un entero estricto (sin decimales, sin signo,
 * sin otros caracteres) o está fuera del rango (RF-04, RF-05; Decisión 001).
 * El mensaje siempre indica los valores admitidos (Decisión 005).
 */
export const validateSettingsField = (
  field: SettingsField,
  raw: string,
): SettingsFieldValidation => {
  const { min, max } = SETTINGS_RANGES[field];
  if (!/^\d+$/.test(raw)) {
    return { valid: false, message: rangeMessage(field) };
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    return { valid: false, message: rangeMessage(field) };
  }
  return { valid: true };
};

/**
 * Validación atómica: si al menos un campo es inválido devuelve
 * `values: null` (no se guarda nada) y el mensaje de cada campo inválido;
 * si los cuatro son válidos devuelve los números y todos los errores en null
 * (RF-05; Decisión 004).
 */
export const validateSettingsForm = (
  input: SettingsInput,
): {
  values: PomodoroSettings | null;
  errors: Record<SettingsField, string | null>;
} => {
  const errors = {} as Record<SettingsField, string | null>;
  let allValid = true;

  for (const field of Object.keys(SETTINGS_RANGES) as SettingsField[]) {
    const result = validateSettingsField(field, input[field]);
    if (result.valid) {
      errors[field] = null;
    } else {
      errors[field] = result.message ?? rangeMessage(field);
      allValid = false;
    }
  }

  if (!allValid) {
    return { values: null, errors };
  }

  return {
    values: {
      studyMinutes: Number(input.studyMinutes),
      shortBreakMinutes: Number(input.shortBreakMinutes),
      longBreakMinutes: Number(input.longBreakMinutes),
      pomodorosPerCycle: Number(input.pomodorosPerCycle),
    },
    errors,
  };
};

/**
 * Rellena los campos en pantalla con 25/5/15/4. Solo produce texto para la
 * pantalla: no persiste ni actualiza el contexto hasta pulsar "Guardar"
 * (RF-06; Decisión 008).
 */
export const resetSettingsInput = (): SettingsInput => ({
  studyMinutes: String(DEFAULT_SETTINGS.studyMinutes),
  shortBreakMinutes: String(DEFAULT_SETTINGS.shortBreakMinutes),
  longBreakMinutes: String(DEFAULT_SETTINGS.longBreakMinutes),
  pomodorosPerCycle: String(DEFAULT_SETTINGS.pomodorosPerCycle),
});
