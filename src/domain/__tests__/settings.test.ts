import { expect, describe, it } from '@jest/globals';

import { DEFAULT_PHASE_DURATIONS } from '../config';
import {
  DEFAULT_SETTINGS,
  SETTINGS_RANGES,
  resetSettingsInput,
  validateSettingsField,
  validateSettingsForm,
  type SettingsField,
  type SettingsInput,
} from '../settings';

const ALL_FIELDS: SettingsField[] = [
  'studyMinutes',
  'shortBreakMinutes',
  'longBreakMinutes',
  'pomodorosPerCycle',
];

const DURATION_FIELDS: SettingsField[] = [
  'studyMinutes',
  'shortBreakMinutes',
  'longBreakMinutes',
];

const validInput = (): SettingsInput => ({
  studyMinutes: '45',
  shortBreakMinutes: '10',
  longBreakMinutes: '20',
  pomodorosPerCycle: '3',
});

describe('settings: rangos permitidos (RF-04, Decisión 001)', () => {
  it('duraciones: enteros de 1 a 120 minutos en los tres campos de tiempo', () => {
    expect(SETTINGS_RANGES.studyMinutes).toEqual({ min: 1, max: 120 });
    expect(SETTINGS_RANGES.shortBreakMinutes).toEqual({ min: 1, max: 120 });
    expect(SETTINGS_RANGES.longBreakMinutes).toEqual({ min: 1, max: 120 });
  });

  it('pomodoros por ciclo: entero de 1 a 12', () => {
    expect(SETTINGS_RANGES.pomodorosPerCycle).toEqual({ min: 1, max: 12 });
  });
});

describe('settings: validateSettingsField rechaza valores no válidos (RF-04)', () => {
  for (const field of ALL_FIELDS) {
    it(`${field}: un campo vacío es inválido y el mensaje indica el rango admitido`, () => {
      const result = validateSettingsField(field, '');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(
        `Ingresa un número entre ${SETTINGS_RANGES[field].min} y ${SETTINGS_RANGES[field].max}`,
      );
    });

    it(`${field}: cero es inválido`, () => {
      expect(validateSettingsField(field, '0').valid).toBe(false);
    });

    it(`${field}: un texto no numérico es inválido`, () => {
      expect(validateSettingsField(field, 'abc').valid).toBe(false);
    });

    it(`${field}: un número con signo negativo es inválido`, () => {
      expect(validateSettingsField(field, '-5').valid).toBe(false);
    });

    it(`${field}: un valor fuera del rango superior es inválido y su mensaje indica el rango`, () => {
      const above = field === 'pomodorosPerCycle' ? '13' : '121';
      const result = validateSettingsField(field, above);
      expect(result.valid).toBe(false);
      expect(result.message).toBe(
        `Ingresa un número entre ${SETTINGS_RANGES[field].min} y ${SETTINGS_RANGES[field].max}`,
      );
    });

    it(`${field}: acepta el límite inferior y el límite superior exactos`, () => {
      const { min, max } = SETTINGS_RANGES[field];
      expect(validateSettingsField(field, String(min)).valid).toBe(true);
      expect(validateSettingsField(field, String(max)).valid).toBe(true);
    });
  }

  it('las duraciones rechazan decimales (sin valores con punto)', () => {
    for (const field of DURATION_FIELDS) {
      expect(validateSettingsField(field, '25.5').valid).toBe(false);
    }
  });

  it('pomodoros por ciclo rechaza decimales', () => {
    expect(validateSettingsField('pomodorosPerCycle', '3.5').valid).toBe(false);
  });
});

describe('settings: validateSettingsForm valida de forma atómica (RF-05, Decisión 004)', () => {
  it('con los cuatro campos válidos devuelve los valores numéricos y sin errores', () => {
    const result = validateSettingsForm(validInput());
    expect(result.values).toEqual({
      studyMinutes: 45,
      shortBreakMinutes: 10,
      longBreakMinutes: 20,
      pomodorosPerCycle: 3,
    });
    expect(result.errors).toEqual({
      studyMinutes: null,
      shortBreakMinutes: null,
      longBreakMinutes: null,
      pomodorosPerCycle: null,
    });
  });

  it('con un solo campo inválido devuelve values: null y el mensaje de ese campo', () => {
    const input = validInput();
    input.studyMinutes = '0';
    const result = validateSettingsForm(input);
    expect(result.values).toBeNull();
    expect(result.errors.studyMinutes).toBe('Ingresa un número entre 1 y 120');
    expect(result.errors.shortBreakMinutes).toBeNull();
    expect(result.errors.longBreakMinutes).toBeNull();
    expect(result.errors.pomodorosPerCycle).toBeNull();
  });

  it('con un campo fuera de rango no propone guardar ninguno (o todo o nada)', () => {
    const input = validInput();
    input.pomodorosPerCycle = '13';
    const result = validateSettingsForm(input);
    expect(result.values).toBeNull();
    expect(result.errors.pomodorosPerCycle).toBe('Ingresa un número entre 1 y 12');
    expect(result.errors.studyMinutes).toBeNull();
  });

  it('con varios campos inválidos devuelve values: null y el mensaje de cada uno', () => {
    const input = validInput();
    input.studyMinutes = '';
    input.longBreakMinutes = '25.5';
    const result = validateSettingsForm(input);
    expect(result.values).toBeNull();
    expect(result.errors.studyMinutes).toBe('Ingresa un número entre 1 y 120');
    expect(result.errors.longBreakMinutes).toBe('Ingresa un número entre 1 y 120');
    expect(result.errors.shortBreakMinutes).toBeNull();
  });

  it('con un campo de texto inválido devuelve values: null', () => {
    const input = validInput();
    input.shortBreakMinutes = 'diez';
    const result = validateSettingsForm(input);
    expect(result.values).toBeNull();
    expect(result.errors.shortBreakMinutes).toBe('Ingresa un número entre 1 y 120');
  });
});

describe('settings: valores por defecto y restablecimiento (RF-06)', () => {
  it('DEFAULT_SETTINGS es 25/5/15/4 y deriva de config.ts', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      studyMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      pomodorosPerCycle: 4,
    });
    expect(DEFAULT_SETTINGS.studyMinutes).toBe(
      DEFAULT_PHASE_DURATIONS.studyMs / 60000,
    );
    expect(DEFAULT_SETTINGS.shortBreakMinutes).toBe(
      DEFAULT_PHASE_DURATIONS.shortBreakMs / 60000,
    );
    expect(DEFAULT_SETTINGS.longBreakMinutes).toBe(
      DEFAULT_PHASE_DURATIONS.longBreakMs / 60000,
    );
    expect(DEFAULT_SETTINGS.pomodorosPerCycle).toBe(
      DEFAULT_PHASE_DURATIONS.pomodorosPerCycle,
    );
  });

  it('resetSettingsInput devuelve los 4 campos como texto por defecto', () => {
    expect(resetSettingsInput()).toEqual({
      studyMinutes: '25',
      shortBreakMinutes: '5',
      longBreakMinutes: '15',
      pomodorosPerCycle: '4',
    });
  });

  it('resetSettingsInput no devuelve estado: es un valor nuevo cada vez', () => {
    const first = resetSettingsInput();
    first.studyMinutes = '99';
    expect(resetSettingsInput().studyMinutes).toBe('25');
  });

  it('el formulario restablecido es válido y produce DEFAULT_SETTINGS', () => {
    const result = validateSettingsForm(resetSettingsInput());
    expect(result.values).toEqual(DEFAULT_SETTINGS);
    expect(result.errors).toEqual({
      studyMinutes: null,
      shortBreakMinutes: null,
      longBreakMinutes: null,
      pomodorosPerCycle: null,
    });
  });
});
