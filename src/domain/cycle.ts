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
 *
 * El descanso largo conserva el contador (acotado al tope) para que la
 * pantalla pueda mostrar el ciclo completo, N/N; el reinicio a cero ocurre
 * al terminarlo, cuando comienza el nuevo ciclo (RF-03 con el ajuste
 * autorizado el 20/10/2026; el registro en las decisiones de la spec 002
 * corresponde al usuario).
 */
export const advanceCycle = (
  cycle: CycleState,
  pomodorosPerCycle: number,
): CycleState => {
  if (cycle.phase === 'longBreak') {
    return { phase: 'study', pomodoros: 0 };
  }
  if (cycle.phase !== 'study') {
    return { phase: 'study', pomodoros: cycle.pomodoros };
  }
  const pomodoros = cycle.pomodoros + 1;
  if (pomodoros >= pomodorosPerCycle) {
    // Acota también el caso en que el contador ya superaba el tope vigente
    // (cambio de ajuste a mitad de ciclo; RF-09 de la spec 005).
    return { phase: 'longBreak', pomodoros: Math.min(pomodoros, pomodorosPerCycle) };
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

/**
 * Texto del contador para la pantalla. Acota el mostrado al tope vigente para
 * no pintar nunca un contador mayor que el total (p. ej. "5/3" tras reducir
 * "pomodoros por ciclo" con un ciclo en curso; RF-09 de la spec 005).
 */
export const pomodoroText = (
  cycle: CycleState,
  pomodorosPerCycle: number,
): string =>
  `Pomodoros: ${Math.min(cycle.pomodoros, pomodorosPerCycle)}/${pomodorosPerCycle}`;
