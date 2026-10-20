import { expect, describe, it, beforeEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS } from '../../domain/settings';
import { CYCLE_STATE_KEY } from '../cycle-state';
import { SETTINGS_KEY, loadSettings, saveSettings } from '../settings';
import { STUDY_RECORD_KEY } from '../study-record';

const CUSTOM = {
  studyMinutes: 45,
  shortBreakMinutes: 10,
  longBreakMinutes: 20,
  pomodorosPerCycle: 3,
};

describe('storage/settings', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('sin dato previo devuelve los valores por defecto 25/5/15/4 (RF-03)', async () => {
    const loaded = await loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
    expect(loaded).toEqual({
      studyMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      pomodorosPerCycle: 4,
    });
  });

  it('ida y vuelta guardar/recuperar conserva los 4 valores (RF-03)', async () => {
    await saveSettings(CUSTOM);
    const loaded = await loadSettings();
    expect(loaded).toEqual(CUSTOM);
  });

  it('el dato guardado usa la clave @pomodoro/settings con formato { version: 1, ... } (RF-03)', async () => {
    await saveSettings(CUSTOM);
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as Record<string, unknown>;
    expect(parsed).toEqual({ version: 1, ...CUSTOM });
    expect(SETTINGS_KEY).toBe('@pomodoro/settings');
  });

  it('guardar dos veces seguidas conserva solo el último valor', async () => {
    await saveSettings(CUSTOM);
    await saveSettings(DEFAULT_SETTINGS);
    const loaded = await loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });

  it('JSON inválido devuelve los valores por defecto sin lanzar (RF-03)', async () => {
    await AsyncStorage.setItem(SETTINGS_KEY, '{no-es-json');
    const loaded = await loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });

  it('JSON que no es un objeto devuelve los valores por defecto', async () => {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify('basura'));
    const loaded = await loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });

  it('un dato con campos no numéricos se considera inválido y devuelve los defectos', async () => {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ version: 1, ...CUSTOM, studyMinutes: 'cuarenta' }),
    );
    const loaded = await loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });

  it('un dato sin los 4 campos se considera inválido y devuelve los defectos', async () => {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ version: 1, studyMinutes: 45 }),
    );
    const loaded = await loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });

  it('guardar ajustes no altera @pomodoro/cycle-state ni @pomodoro/study-record (Constitución 5)', async () => {
    const cyclePayload = JSON.stringify({
      version: 2,
      cycle: { phase: 'study', pomodoros: 2 },
      timer: null,
    });
    const recordPayload = JSON.stringify({
      version: 1,
      record: { day: null, sessionMarked: false },
    });
    await AsyncStorage.setItem(CYCLE_STATE_KEY, cyclePayload);
    await AsyncStorage.setItem(STUDY_RECORD_KEY, recordPayload);

    await saveSettings(CUSTOM);

    expect(await AsyncStorage.getItem(CYCLE_STATE_KEY)).toBe(cyclePayload);
    expect(await AsyncStorage.getItem(STUDY_RECORD_KEY)).toBe(recordPayload);
    expect(await loadSettings()).toEqual(CUSTOM);
  });
});
