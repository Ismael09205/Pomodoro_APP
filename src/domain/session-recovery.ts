import { durationForPhase, type CycleState } from './cycle';
import type { PomodoroSettings } from './settings';
import { createTimer, type Timer } from './timer';

/**
 * Evaluación pura del temporizador almacenado, sin React ni AsyncStorage
 * (RN-01). `now` siempre se inyecta: el módulo no lee el reloj por su cuenta.
 *
 * Solo tiene significado con una fase Corriendo; con Pausada o Inicial el
 * restante queda congelado (RF-12) y se devuelve tal cual.
 */

export type TimerEvaluation =
  | { kind: 'running'; remainingMs: number }
  | { kind: 'expired' }
  | { kind: 'expiredByClockJump' };

export const evaluateTimer = (t: Timer, now: number): TimerEvaluation => {
  if (t.state !== 'running' || t.runningSinceMs === null) {
    // Pausada, Inicial o Finalizado: restante congelado, nunca vencida por
    // el reloj (RF-12).
    return { kind: 'running', remainingMs: t.remainingMs };
  }

  // Restante crudo sin clamar a 0, para poder distinguir vencimiento de
  // retroceso del reloj (RF-09, RF-11, RF-13; Decisión 003 y Decisión 010).
  const raw = t.remainingMs - (now - t.runningSinceMs);

  // Prioridad del vencimiento normal sobre la detección de salto (RF-13).
  if (raw <= 0) {
    return { kind: 'expired' };
  }

  // Invariante: el hook nunca persiste ticks intermedios, por lo que
  // `t.remainingMs` sigue siendo la base del iniciar o continuar; un restante
  // crudo mayor que la base solo puede ocurrir si el reloj retrocedió (RF-11).
  if (raw > t.remainingMs) {
    return { kind: 'expiredByClockJump' };
  }

  return { kind: 'running', remainingMs: raw };
};

/**
 * Resultado de recuperar la sesión almacenada al volver a la aplicación.
 *
 * - `restore`: fase Corriendo viva; el hook la continúa normalizada.
 * - `complete`: la fase Corriendo venció (o el reloj retrocedió); el hook
 *   procesa el vencimiento con la hora actual de reapertura (RF-08, RF-09,
 *   RF-11; Decisión 007).
 * - `none`: sin temporizador persistible (v1 o estado no persistible → Inicial
 *   completo, Decisión 009) o fase Pausada conservada con el restante
 *   congelado (RF-06, RF-07, RF-12; Decisión 005).
 */
export type RecoveryOutcome =
  | { action: 'restore'; timer: Timer }
  | { action: 'complete'; timer: Timer }
  | { action: 'none'; timer: Timer };

export const recoverSession = (
  stored: { cycle: CycleState; timer: Timer | null },
  now: number,
  settings: PomodoroSettings,
): RecoveryOutcome => {
  const { cycle, timer } = stored;

  // Clave v1 sin `timer`, JSON sin temporizador o estado no persistible:
  // la fase guardada se muestra en Inicial con su tiempo completo (RF-01;
  // Decisión 009), con la duración configurada por el estudiante (RF-02).
  if (timer === null || (timer.state !== 'running' && timer.state !== 'paused')) {
    return { action: 'none', timer: createTimer(durationForPhase(cycle.phase, settings)) };
  }

  // Pausada: congelada, sin reanudación automática y sin aviso
  // (RF-06, RF-07, RF-12; Decisión 005).
  if (timer.state === 'paused') {
    return { action: 'none', timer };
  }

  const evaluation = evaluateTimer(timer, now);

  if (evaluation.kind === 'running') {
    // Normalización (DT-7): la restauración equivale al reloj correcto y deja
    // `runningSinceMs` en el nuevo punto de partida (RF-02, RF-03).
    return {
      action: 'restore',
      timer: {
        ...timer,
        runningSinceMs: now,
        remainingMs: evaluation.remainingMs,
      },
    };
  }

  // Vencimiento normal o salto anómalo: mismo camino de vencimiento, procesado
  // por el hook con la hora de reapertura (RF-08, RF-10, RF-11; RF-14: sin
  // señal visible en el resultado).
  return { action: 'complete', timer };
};
