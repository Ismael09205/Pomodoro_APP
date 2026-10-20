import type { StudyPhase } from './session-record';
import type { PomodoroSettings } from './settings';
import { createTimer, type Timer } from './timer';

export type CycleState = {
  phase: StudyPhase;
  pomodoros: number;
};

const MS_PER_MINUTE = 60 * 1000;

export const emptyCycle = (): CycleState => ({
  phase: 'study',
  pomodoros: 0,
});

/**
 * Duración de la fase según los ajustes vigentes del estudiante; los minutos
 * configurados se convierten a milisegundos (RF-02; Constitución 11).
 */
export const durationForPhase = (
  phase: StudyPhase,
  settings: PomodoroSettings,
): number => {
  switch (phase) {
    case 'shortBreak':
      return settings.shortBreakMinutes * MS_PER_MINUTE;
    case 'longBreak':
      return settings.longBreakMinutes * MS_PER_MINUTE;
    case 'study':
    default:
      return settings.studyMinutes * MS_PER_MINUTE;
  }
};

/**
 * Única función que muta el contador del ciclo; se invoca exclusivamente
 * cuando una fase llega a 00:00 (RF-01 a RF-04, RF-09, RF-10).
 */
export const advanceCycle = (
  cycle: CycleState,
  pomodorosPerCycle: number,
): CycleState => {
  if (cycle.phase !== 'study') {
    return { phase: 'study', pomodoros: cycle.pomodoros };
  }
  const pomodoros = cycle.pomodoros + 1;
  if (pomodoros >= pomodorosPerCycle) {
    return { phase: 'longBreak', pomodoros: 0 };
  }
  return { phase: 'shortBreak', pomodoros };
};

/**
 * La siguiente fase nace en estado Inicial con su tiempo completo y el
 * control "Iniciar" (RF-06, RF-07; Decisión 002), con la duración
 * configurada por el estudiante (RF-02, RF-07).
 */
export const nextTimerFor = (
  cycle: CycleState,
  settings: PomodoroSettings,
): Timer => createTimer(durationForPhase(cycle.phase, settings));

export const phaseLabel = (phase: StudyPhase): string => {
  switch (phase) {
    case 'shortBreak':
      return 'Descanso corto';
    case 'longBreak':
      return 'Descanso largo';
    case 'study':
    default:
      return 'Estudio';
  }
};

export const pomodoroText = (
  cycle: CycleState,
  pomodorosPerCycle: number,
): string => `Pomodoros: ${cycle.pomodoros}/${pomodorosPerCycle}`;
