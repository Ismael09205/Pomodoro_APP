import { expect, describe, it } from '@jest/globals';

import { emptyCycle } from '../cycle';
import {
  createTimer,
  pauseTimer,
  resumeTimer,
  startTimer,
  type Timer,
} from '../timer';
import { evaluateTimer, recoverSession } from '../session-recovery';
import { DEFAULT_SETTINGS } from '../settings';

const MINUTE_MS = 60 * 1000;

const runningTimerAt = (
  durationMs: number,
  baseRemainingMs: number,
  runningSinceMs: number,
): Timer => ({
  state: 'running',
  durationMs,
  remainingMs: baseRemainingMs,
  runningSinceMs,
});

describe('session-recovery/evaluateTimer', () => {
  it('con Corriendo devuelve el restante exacto descontado del reloj inyectado (RF-02, RF-03, RF-04)', () => {
    const duration = 25 * MINUTE_MS;
    const t = runningTimerAt(duration, 20 * MINUTE_MS, 1_000_000);
    const now = 1_000_000 + 3 * MINUTE_MS;
    expect(evaluateTimer(t, now)).toEqual({
      kind: 'running',
      remainingMs: 17 * MINUTE_MS,
    });
  });

  it('con Corriendo, sin tiempo transcurrido, devuelve el restante base intacto (RF-04)', () => {
    const t = runningTimerAt(25 * MINUTE_MS, 25 * MINUTE_MS, 5_000);
    expect(evaluateTimer(t, 5_000)).toEqual({
      kind: 'running',
      remainingMs: 25 * MINUTE_MS,
    });
  });

  it('con Corriendo, cuando el restante crudo llega exactamente a 0 lo trata como vencimiento normal (RF-09, RF-13)', () => {
    const t = runningTimerAt(25 * MINUTE_MS, 10 * MINUTE_MS, 1_000_000);
    const now = 1_000_000 + 10 * MINUTE_MS;
    expect(evaluateTimer(t, now)).toEqual({ kind: 'expired' });
  });

  it('con Corriendo, cuando el restante crudo es negativo lo trata como vencimiento normal (RF-09, RF-13)', () => {
    const t = runningTimerAt(25 * MINUTE_MS, 10 * MINUTE_MS, 1_000_000);
    const now = 1_000_000 + 40 * MINUTE_MS;
    expect(evaluateTimer(t, now)).toEqual({ kind: 'expired' });
  });

  it('con Corriendo, un vencimiento normal se detecta antes que el salto anómalo (RF-13)', () => {
    // Aunque "now" quede muy por delante, la rama de vencimiento tiene prioridad
    // sobre la detección de salto (Decisión 010): el resultado es "expired".
    const t = runningTimerAt(25 * MINUTE_MS, 25 * MINUTE_MS, 1_000_000);
    const now = 1_000_000 + 3 * 24 * 60 * MINUTE_MS;
    expect(evaluateTimer(t, now).kind).toBe('expired');
  });

  it('con Corriendo, si el reloj retrocede respecto del arranque devuelve expiredByClockJump (RF-11)', () => {
    const t = runningTimerAt(25 * MINUTE_MS, 20 * MINUTE_MS, 1_000_000);
    // now < runningSinceMs: el restante crudo (23 min) supera la base (20 min).
    const now = 1_000_000 - 3 * MINUTE_MS;
    expect(evaluateTimer(t, now)).toEqual({ kind: 'expiredByClockJump' });
  });

  it('con Corriendo, si el reloj retrocede tras avanzar un rato devuelve expiredByClockJump (RF-11)', () => {
    const t = runningTimerAt(25 * MINUTE_MS, 20 * MINUTE_MS, 1_000_000);
    const now = 1_000_000 + 2 * MINUTE_MS; // restante crudo 18 min < 20... no salto
    expect(evaluateTimer(t, now).kind).toBe('running');
    const jumped = runningTimerAt(25 * MINUTE_MS, 20 * MINUTE_MS, 1_000_000);
    const nowJumped = 1_000_000 - 1_000; // retrocede 1 s: crudo 20 min + 1 s > 20 min
    expect(evaluateTimer(jumped, nowJumped).kind).toBe('expiredByClockJump');
  });

  it('con Pausada el restante queda congelado, por lejos que esté el reloj (RF-12)', () => {
    const duration = 25 * MINUTE_MS;
    const running = startTimer(createTimer(duration), 1_000_000);
    const paused = pauseTimer(running, 1_000_000 + 5 * MINUTE_MS);
    expect(paused.remainingMs).toBe(20 * MINUTE_MS);
    // Reloj muy por delante: sigue congelado.
    expect(evaluateTimer(paused, 1_000_000 + 999 * MINUTE_MS)).toEqual({
      kind: 'running',
      remainingMs: 20 * MINUTE_MS,
    });
    // Reloj retrocedido: nunca se marca vencida por el reloj (RF-12).
    expect(evaluateTimer(paused, 1_000_000 - 60 * MINUTE_MS)).toEqual({
      kind: 'running',
      remainingMs: 20 * MINUTE_MS,
    });
  });

  it('con Inicial el restante es el tiempo completo, congelado (RF-12)', () => {
    const t = createTimer(25 * MINUTE_MS);
    expect(evaluateTimer(t, 9_999_999)).toEqual({
      kind: 'running',
      remainingMs: 25 * MINUTE_MS,
    });
    expect(evaluateTimer(t, -9_999_999)).toEqual({
      kind: 'running',
      remainingMs: 25 * MINUTE_MS,
    });
  });

  it('con Finalizado el restante queda congelado (RF-12)', () => {
    const t: Timer = {
      state: 'finished',
      durationMs: 25 * MINUTE_MS,
      remainingMs: 0,
      runningSinceMs: null,
    };
    expect(evaluateTimer(t, 1_000_000)).toEqual({
      kind: 'running',
      remainingMs: 0,
    });
  });

  it('con Corriendo sin runningSinceMs el restante queda congelado (RF-04)', () => {
    const t: Timer = {
      state: 'running',
      durationMs: 25 * MINUTE_MS,
      remainingMs: 12 * MINUTE_MS,
      runningSinceMs: null,
    };
    expect(evaluateTimer(t, 1_000_000)).toEqual({
      kind: 'running',
      remainingMs: 12 * MINUTE_MS,
    });
  });

  it('el resultado no incluye ninguna señal visible ni campo de aviso (RF-14)', () => {
    const running = runningTimerAt(25 * MINUTE_MS, 20 * MINUTE_MS, 1_000_000);
    const expired = runningTimerAt(25 * MINUTE_MS, 10 * MINUTE_MS, 1_000_000);
    const jumped = runningTimerAt(25 * MINUTE_MS, 20 * MINUTE_MS, 1_000_000);

    const results = [
      evaluateTimer(running, 1_000_000),
      evaluateTimer(expired, 1_000_000 + 60 * MINUTE_MS),
      evaluateTimer(jumped, 500_000),
      evaluateTimer(createTimer(25 * MINUTE_MS), 1),
    ];
    const allowedKeys = new Set(['kind', 'remainingMs']);
    for (const result of results) {
      for (const key of Object.keys(result)) {
        expect(allowedKeys.has(key)).toBe(true);
      }
    }
    // Los vencidos no llevan restante ni ningún campo de aviso.
    for (const result of [results[1], results[2]]) {
      expect(result).toEqual({ kind: result.kind });
    }
    expect(emptyCycle().phase).toBe('study'); // sanity del import del dominio
  });

  it('reanudar tras pausar vuelve a descontar desde el nuevo arranque (RF-04)', () => {
    const duration = 25 * MINUTE_MS;
    const started = startTimer(createTimer(duration), 1_000_000);
    // A los 10 min quedan 15 min; se pausa 20 min (tiempo no descontado).
    const paused = pauseTimer(started, 1_000_000 + 10 * MINUTE_MS);
    const resumed = resumeTimer(paused, 1_000_000 + 30 * MINUTE_MS);
    expect(evaluateTimer(resumed, 1_000_000 + 35 * MINUTE_MS)).toEqual({
      kind: 'running',
      remainingMs: 10 * MINUTE_MS,
    });
    expect(
      evaluateTimer(resumed, 1_000_000 + 45 * MINUTE_MS),
    ).toEqual({ kind: 'expired' });
  });
});

describe('session-recovery/recoverSession', () => {
  const MIN = 60 * 1000;

  it('con timer null (clave v1 sin temporizador) devuelve la fase guardada en Inicial con su tiempo completo (RF-01, RF-05, Decisión 009)', () => {
    const stored = { cycle: { phase: 'shortBreak' as const, pomodoros: 2 }, timer: null };
    const outcome = recoverSession(stored, 1_000_000, DEFAULT_SETTINGS);
    expect(outcome.action).toBe('none');
    expect(outcome.timer).toEqual(createTimer(5 * MIN));
  });

  it('sin dato previo devuelve la fase por defecto en Inicial con su tiempo completo (RF-01)', () => {
    const outcome = recoverSession({ cycle: emptyCycle(), timer: null }, 1_000_000, DEFAULT_SETTINGS);
    expect(outcome.action).toBe('none');
    expect(outcome.timer).toEqual(createTimer(25 * MIN));
  });

  it('reconstruye el temporizador inicial con la duración configurada por el estudiante (RF-02, RF-03)', () => {
    const configured = {
      studyMinutes: 45,
      shortBreakMinutes: 10,
      longBreakMinutes: 20,
      pomodorosPerCycle: 3,
    };
    const outcome = recoverSession(
      { cycle: { phase: 'study' as const, pomodoros: 1 }, timer: null },
      1_000_000,
      configured,
    );
    expect(outcome.action).toBe('none');
    expect(outcome.timer).toEqual(createTimer(45 * MIN));
  });

  it('con estado no Corriendo/Pausado (Finalizado) devuelve Inicial con el tiempo completo de la fase (RF-01)', () => {
    const stored = {
      cycle: { phase: 'study' as const, pomodoros: 1 },
      timer: { state: 'finished' as const, durationMs: 25 * MIN, remainingMs: 0, runningSinceMs: null },
    };
    const outcome = recoverSession(stored, 1_000_000, DEFAULT_SETTINGS);
    expect(outcome.action).toBe('none');
    expect(outcome.timer).toEqual(createTimer(25 * MIN));
  });

  it('con Pausada se conserva congelada, sin reanudar y sin producir complete (RF-06, RF-07, RF-12)', () => {
    const started = startTimer(createTimer(25 * MIN), 1_000_000);
    const paused = pauseTimer(started, 1_000_000 + 8 * MIN); // quedan 17 min
    const stored = { cycle: { phase: 'study' as const, pomodoros: 0 }, timer: paused };
    // Reloj muy por delante: no se reanuda, no vence, no hay aviso.
    const outcome = recoverSession(stored, 1_000_000 + 500 * MIN, DEFAULT_SETTINGS);
    expect(outcome.action).toBe('none');
    expect(outcome.timer.state).toBe('paused');
    expect(outcome.timer.remainingMs).toBe(17 * MIN);
    expect(outcome.timer.runningSinceMs).toBeNull();
  });

  it('con Corriendo viva restaura normalizado: runningSinceMs = ahora y el restante descontado (RF-02, RF-03)', () => {
    const t = runningTimerAt(25 * MIN, 20 * MIN, 1_000_000);
    const stored = { cycle: { phase: 'study' as const, pomodoros: 0 }, timer: t };
    const now = 1_000_000 + 3 * MIN;
    const outcome = recoverSession(stored, now, DEFAULT_SETTINGS);
    expect(outcome.action).toBe('restore');
    expect(outcome.timer).toEqual({
      state: 'running',
      durationMs: 25 * MIN,
      remainingMs: 17 * MIN,
      runningSinceMs: now,
    });
  });

  it('con Corriendo vencida devuelve complete (RF-08, RF-10)', () => {
    const t = runningTimerAt(25 * MIN, 10 * MIN, 1_000_000);
    const stored = { cycle: { phase: 'study' as const, pomodoros: 0 }, timer: t };
    const outcome = recoverSession(stored, 1_000_000 + 30 * MIN, DEFAULT_SETTINGS);
    expect(outcome.action).toBe('complete');
    expect(outcome.timer).toBe(t);
  });

  it('con Corriendo y salto anómalo del reloj devuelve complete (RF-11, RF-14)', () => {
    const t = runningTimerAt(25 * MIN, 20 * MIN, 1_000_000);
    const stored = { cycle: { phase: 'study' as const, pomodoros: 0 }, timer: t };
    const outcome = recoverSession(stored, 1_000_000 - 5 * MIN, DEFAULT_SETTINGS);
    expect(outcome.action).toBe('complete');
  });

  it('ninguna rama devuelve campos de aviso ni señal visible (RF-07, RF-14)', () => {
    const running = runningTimerAt(25 * MIN, 20 * MIN, 1_000_000);
    const expired = runningTimerAt(25 * MIN, 10 * MIN, 1_000_000);
    const outcomes = [
      recoverSession({ cycle: emptyCycle(), timer: null }, 1, DEFAULT_SETTINGS),
      recoverSession({ cycle: emptyCycle(), timer: running }, 1_000_000, DEFAULT_SETTINGS),
      recoverSession({ cycle: emptyCycle(), timer: expired }, 1_000_000 + 60 * MIN, DEFAULT_SETTINGS),
    ];
    const allowedKeys = new Set(['action', 'timer']);
    for (const outcome of outcomes) {
      for (const key of Object.keys(outcome)) {
        expect(allowedKeys.has(key)).toBe(true);
      }
      expect(Object.keys(outcome.timer).sort()).toEqual(
        ['durationMs', 'remainingMs', 'runningSinceMs', 'state'],
      );
    }
  });
});
