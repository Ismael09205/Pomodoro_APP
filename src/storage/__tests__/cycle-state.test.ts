import { expect, describe, it, beforeEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { emptyCycle } from '../../domain/cycle';
import { createTimer, type Timer } from '../../domain/timer';
import {
  CYCLE_STATE_KEY,
  loadCycleState,
  saveCycleState,
} from '../cycle-state';
import { STUDY_RECORD_KEY } from '../study-record';

const MIN = 60 * 1000;

const runningTimer = (): Timer => ({
  state: 'running',
  durationMs: 25 * MIN,
  remainingMs: 17 * MIN,
  runningSinceMs: 1_760_000_000_000,
});

describe('storage/cycle-state', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('roundtrip guardar/recuperar produce el mismo ciclo y temporizador v2 (RF-01)', async () => {
    const session = {
      cycle: { phase: 'shortBreak' as const, pomodoros: 2 },
      timer: runningTimer(),
    };
    await saveCycleState(session);
    const loaded = await loadCycleState();
    expect(loaded).toEqual(session);
  });

  it('el dato guardado es version 2 con el campo timer (RF-01, RF-05)', async () => {
    const session = { cycle: emptyCycle(), timer: createTimer(25 * MIN) };
    await saveCycleState(session);
    const raw = await AsyncStorage.getItem(CYCLE_STATE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as {
      version: number;
      cycle: unknown;
      timer: unknown;
    };
    expect(parsed.version).toBe(2);
    expect(parsed.cycle).toEqual(emptyCycle());
    expect(parsed.timer).toEqual(createTimer(25 * MIN));
  });

  it('un v1 sin timer devuelve timer: null con fase y pomodoros intactos (Decisión 009)', async () => {
    const v1Payload = JSON.stringify({
      version: 1,
      cycle: { phase: 'longBreak', pomodoros: 3 },
    });
    await AsyncStorage.setItem(CYCLE_STATE_KEY, v1Payload);
    const loaded = await loadCycleState();
    expect(loaded).toEqual({
      cycle: { phase: 'longBreak', pomodoros: 3 },
      timer: null,
    });
  });

  it('un v2 con timer inválido devuelve timer: null sin perder el ciclo (RF-01)', async () => {
    await AsyncStorage.setItem(
      CYCLE_STATE_KEY,
      JSON.stringify({ version: 2, cycle: { phase: 'study', pomodoros: 1 }, timer: 'basura' }),
    );
    const loaded = await loadCycleState();
    expect(loaded).toEqual({
      cycle: { phase: 'study', pomodoros: 1 },
      timer: null,
    });
  });

  it('sin dato previo devuelve emptyCycle() y timer: null (RF-05)', async () => {
    const loaded = await loadCycleState();
    expect(loaded).toEqual({ cycle: emptyCycle(), timer: null });
  });

  it('JSON inválido devuelve emptyCycle() y timer: null sin lanzar', async () => {
    await AsyncStorage.setItem(CYCLE_STATE_KEY, '{no-es-json');
    const loaded = await loadCycleState();
    expect(loaded).toEqual({ cycle: emptyCycle(), timer: null });
  });

  it('guardar la sesión no toca la clave @pomodoro/study-record (RN-03)', async () => {
    const studyPayload = JSON.stringify({
      version: 1,
      record: { day: null, sessionMarked: false },
    });
    await AsyncStorage.setItem(STUDY_RECORD_KEY, studyPayload);

    await saveCycleState({
      cycle: { phase: 'longBreak', pomodoros: 0 },
      timer: createTimer(15 * MIN),
    });

    const studyAfter = await AsyncStorage.getItem(STUDY_RECORD_KEY);
    expect(studyAfter).toBe(studyPayload);
    const storedCycle = await AsyncStorage.getItem(CYCLE_STATE_KEY);
    expect(storedCycle).not.toBeNull();
    expect(CYCLE_STATE_KEY).toBe('@pomodoro/cycle-state');
    expect(CYCLE_STATE_KEY).not.toBe(STUDY_RECORD_KEY);
  });

  it('guardar una sesión no altera otra guardada antes (RF-01)', async () => {
    await saveCycleState({
      cycle: { phase: 'study', pomodoros: 3 },
      timer: createTimer(25 * MIN),
    });
    await saveCycleState({
      cycle: { phase: 'longBreak', pomodoros: 0 },
      timer: createTimer(15 * MIN),
    });
    const loaded = await loadCycleState();
    expect(loaded).toEqual({
      cycle: { phase: 'longBreak', pomodoros: 0 },
      timer: createTimer(15 * MIN),
    });
  });
});
