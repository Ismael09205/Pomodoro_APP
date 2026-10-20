import { expect, describe, it } from '@jest/globals';

import { DEFAULT_PHASE_DURATIONS } from '../config';
import {
  advanceCycle,
  durationForPhase,
  emptyCycle,
  nextTimerFor,
  phaseLabel,
  pomodoroText,
  type CycleState,
} from '../cycle';
import {
  DEFAULT_SETTINGS,
  type PomodoroSettings,
} from '../settings';
import { controlsFor } from '../timer';

const CUSTOM_SETTINGS: PomodoroSettings = {
  studyMinutes: 45,
  shortBreakMinutes: 10,
  longBreakMinutes: 20,
  pomodorosPerCycle: 3,
};

describe('cycle: transición al 00:00 de un tiempo de estudio', () => {
  it('bajo la cantidad configurada deja descanso corto con el contador incrementado en uno (RF-01, RF-02)', () => {
    const cycle: CycleState = { phase: 'study', pomodoros: 1 };
    expect(advanceCycle(cycle, 4)).toEqual({ phase: 'shortBreak', pomodoros: 2 });
  });

  it('el primer estudio completo también incrementa de 0 a 1 (RF-02)', () => {
    expect(advanceCycle(emptyCycle(), 4)).toEqual({ phase: 'shortBreak', pomodoros: 1 });
  });

  it('al alcanzar la cantidad configurada deja descanso largo y el contador vuelve a cero (RF-03)', () => {
    const cycle: CycleState = { phase: 'study', pomodoros: 3 };
    expect(advanceCycle(cycle, 4)).toEqual({ phase: 'longBreak', pomodoros: 0 });
  });

  it('no muta el estado recibido', () => {
    const cycle: CycleState = { phase: 'study', pomodoros: 1 };
    advanceCycle(cycle, 4);
    expect(cycle).toEqual({ phase: 'study', pomodoros: 1 });
  });
});

describe('cycle: transición al 00:00 de un descanso', () => {
  it('descanso corto terminado deja el siguiente estudio con el contador intacto (RF-04, RF-09)', () => {
    const cycle: CycleState = { phase: 'shortBreak', pomodoros: 2 };
    expect(advanceCycle(cycle, 4)).toEqual({ phase: 'study', pomodoros: 2 });
  });

  it('descanso largo terminado deja el siguiente estudio con el contador intacto (RF-04, RF-09)', () => {
    const cycle: CycleState = { phase: 'longBreak', pomodoros: 0 };
    expect(advanceCycle(cycle, 4)).toEqual({ phase: 'study', pomodoros: 0 });
  });

  it('un descanso nunca incrementa ni retrocede el contador (RF-09)', () => {
    const before: CycleState = { phase: 'shortBreak', pomodoros: 3 };
    const after = advanceCycle(before, 4);
    expect(after.pomodoros).toBe(before.pomodoros);
  });
});

describe('cycle: advanceCycle es la única mutación del contador (RF-10)', () => {
  it('una sesión de estudio reiniciada y más tarde completada suma una sola vez', () => {
    // Reiniciar no pasa por cycle.ts: el ciclo queda intacto.
    let cycle = emptyCycle();
    // Único punto de mutación: el 00:00 de un estudio completado.
    cycle = advanceCycle(cycle, 4);
    expect(cycle.pomodoros).toBe(1);
    // Un reinicio intermedio (sin llamada a advanceCycle) no cambia nada:
    expect(cycle).toEqual({ phase: 'shortBreak', pomodoros: 1 });
    // Segundo estudio completado:
    cycle = advanceCycle({ phase: 'study', pomodoros: cycle.pomodoros }, 4);
    expect(cycle.pomodoros).toBe(2);
  });
});

describe('cycle: nextTimerFor deja la siguiente fase lista (RF-06, RF-07)', () => {
  it('descanso corto: estado Inicial con su duración completa y control "Iniciar"', () => {
    const timer = nextTimerFor({ phase: 'shortBreak', pomodoros: 1 }, DEFAULT_SETTINGS);
    expect(timer.state).toBe('initial');
    expect(timer.durationMs).toBe(DEFAULT_PHASE_DURATIONS.shortBreakMs);
    expect(timer.remainingMs).toBe(DEFAULT_PHASE_DURATIONS.shortBreakMs);
    expect(controlsFor(timer.state)).toEqual(['start']);
  });

  it('descanso largo: estado Inicial con su duración completa y control "Iniciar"', () => {
    const timer = nextTimerFor({ phase: 'longBreak', pomodoros: 0 }, DEFAULT_SETTINGS);
    expect(timer.state).toBe('initial');
    expect(timer.durationMs).toBe(DEFAULT_PHASE_DURATIONS.longBreakMs);
    expect(timer.remainingMs).toBe(DEFAULT_PHASE_DURATIONS.longBreakMs);
    expect(controlsFor(timer.state)).toEqual(['start']);
  });

  it('estudio: estado Inicial con su duración completa y control "Iniciar"', () => {
    const timer = nextTimerFor({ phase: 'study', pomodoros: 2 }, DEFAULT_SETTINGS);
    expect(timer.state).toBe('initial');
    expect(timer.durationMs).toBe(DEFAULT_PHASE_DURATIONS.studyMs);
    expect(timer.remainingMs).toBe(DEFAULT_PHASE_DURATIONS.studyMs);
    expect(controlsFor(timer.state)).toEqual(['start']);
  });
});

describe('cycle: durationForPhase usa los ajustes vigentes (RF-02, RF-07)', () => {
  it('convierte los minutos configurados de cada fase a milisegundos', () => {
    expect(durationForPhase('study', CUSTOM_SETTINGS)).toBe(45 * 60 * 1000);
    expect(durationForPhase('shortBreak', CUSTOM_SETTINGS)).toBe(10 * 60 * 1000);
    expect(durationForPhase('longBreak', CUSTOM_SETTINGS)).toBe(20 * 60 * 1000);
  });

  it('con los ajustes por defecto conserva los valores de config.ts (Constitución 11)', () => {
    expect(durationForPhase('study', DEFAULT_SETTINGS)).toBe(DEFAULT_PHASE_DURATIONS.studyMs);
    expect(durationForPhase('shortBreak', DEFAULT_SETTINGS)).toBe(DEFAULT_PHASE_DURATIONS.shortBreakMs);
    expect(durationForPhase('longBreak', DEFAULT_SETTINGS)).toBe(DEFAULT_PHASE_DURATIONS.longBreakMs);
  });

  it('no muta los ajustes recibidos', () => {
    const before = { ...CUSTOM_SETTINGS };
    durationForPhase('study', CUSTOM_SETTINGS);
    expect(CUSTOM_SETTINGS).toEqual(before);
  });
});

describe('cycle: nextTimerFor crea la siguiente fase con la duración configurada (RF-02, RF-07)', () => {
  it('siguiente descanso corto con los minutos configurados', () => {
    const timer = nextTimerFor({ phase: 'shortBreak', pomodoros: 1 }, CUSTOM_SETTINGS);
    expect(timer.state).toBe('initial');
    expect(timer.durationMs).toBe(10 * 60 * 1000);
    expect(timer.remainingMs).toBe(10 * 60 * 1000);
    expect(controlsFor(timer.state)).toEqual(['start']);
  });

  it('siguiente descanso largo con los minutos configurados', () => {
    const timer = nextTimerFor({ phase: 'longBreak', pomodoros: 0 }, CUSTOM_SETTINGS);
    expect(timer.durationMs).toBe(20 * 60 * 1000);
    expect(timer.remainingMs).toBe(20 * 60 * 1000);
  });

  it('siguiente estudio con los minutos configurados', () => {
    const timer = nextTimerFor({ phase: 'study', pomodoros: 2 }, CUSTOM_SETTINGS);
    expect(timer.durationMs).toBe(45 * 60 * 1000);
    expect(timer.remainingMs).toBe(45 * 60 * 1000);
  });
});

describe('cycle: advanceCycle con pomodoros por ciclo personalizado (RF-09, Decisión 003)', () => {
  it('contador que ya supera el nuevo valor (5 con perCycle 3) deja descanso largo', () => {
    expect(advanceCycle({ phase: 'study', pomodoros: 5 }, 3)).toEqual({
      phase: 'longBreak',
      pomodoros: 0,
    });
  });

  it('contador que alcanza exactamente el nuevo valor deja descanso largo', () => {
    expect(advanceCycle({ phase: 'study', pomodoros: 3 }, 3)).toEqual({
      phase: 'longBreak',
      pomodoros: 0,
    });
  });

  it('por debajo del nuevo valor deja descanso corto con el contador incrementado', () => {
    expect(advanceCycle({ phase: 'study', pomodoros: 1 }, 3)).toEqual({
      phase: 'shortBreak',
      pomodoros: 2,
    });
  });

  it('con 1 pomodoro por ciclo el primer estudio completo deja descanso largo', () => {
    expect(advanceCycle({ phase: 'study', pomodoros: 0 }, 1)).toEqual({
      phase: 'longBreak',
      pomodoros: 0,
    });
  });
});

describe('cycle: textos de la pantalla principal (RF-08, Decisión 008)', () => {
  it('phaseLabel produce las etiquetas exactas de la fase', () => {
    expect(phaseLabel('study')).toBe('Estudio');
    expect(phaseLabel('shortBreak')).toBe('Descanso corto');
    expect(phaseLabel('longBreak')).toBe('Descanso largo');
  });

  it('pomodoroText produce "Pomodoros: <completados>/<configurados>"', () => {
    expect(pomodoroText({ phase: 'study', pomodoros: 2 }, 4)).toBe('Pomodoros: 2/4');
    expect(pomodoroText({ phase: 'shortBreak', pomodoros: 3 }, 4)).toBe('Pomodoros: 3/4');
  });

  it('con el descanso largo listo muestra "Pomodoros: 0/4"', () => {
    expect(pomodoroText({ phase: 'longBreak', pomodoros: 0 }, 4)).toBe('Pomodoros: 0/4');
  });
});
