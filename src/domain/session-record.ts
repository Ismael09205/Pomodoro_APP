import type { TimerState } from './timer';

export type StudyPhase = 'study' | 'shortBreak' | 'longBreak';

export type DayRecord = {
  startMs: number;
  completed: number;
  incomplete: number;
  markCounted: boolean;
};

export type StudyRecord = {
  day: DayRecord | null;
  sessionMarked: boolean;
};

export type RecordEvent = 'start' | 'reset' | 'complete';

export type Summary =
  | { type: 'empty' }
  | { type: 'summary'; completed: number; incomplete: number; startMs: number };

const DAY_MS = 24 * 60 * 60 * 1000;

export const emptyStudyRecord = (): StudyRecord => ({
  day: null,
  sessionMarked: false,
});

export const newDay = (now: number): DayRecord => ({
  startMs: now,
  completed: 0,
  incomplete: 0,
  markCounted: false,
});

const isSessionInProgress = (state: TimerState): boolean =>
  state === 'running' || state === 'paused';

const applyCutoff = (
  record: StudyRecord,
  now: number,
  event: RecordEvent,
  phase: StudyPhase,
  sessionInProgress: boolean,
): StudyRecord => {
  if (record.day === null) return record;
  if (now < record.day.startMs + DAY_MS) return record;

  if (
    (event === 'complete' || event === 'reset') &&
    phase === 'study' &&
    sessionInProgress
  ) {
    return { ...record, day: newDay(now) };
  }

  if (event === 'start' && phase === 'study') {
    return { ...record, day: newDay(now) };
  }

  return record;
};

export const applyTimerStart = (
  record: StudyRecord,
  phase: StudyPhase,
  now: number,
): StudyRecord => {
  let next = applyCutoff(record, now, 'start', phase, false);
  if (next.day === null && phase === 'study') {
    next = { ...next, day: newDay(now) };
  }
  return next;
};

export const applyTimerReset = (
  record: StudyRecord,
  phase: StudyPhase,
  previousState: TimerState,
  now: number,
): StudyRecord => {
  const sessionInProgress = isSessionInProgress(previousState);
  let next = applyCutoff(record, now, 'reset', phase, sessionInProgress);

  if (phase !== 'study' || !sessionInProgress) {
    return next;
  }

  const day = next.day ?? newDay(now);
  let sessionMarked = next.sessionMarked;
  let incomplete = day.incomplete;
  let markCounted = day.markCounted;

  if (!sessionMarked) {
    sessionMarked = true;
  }
  if (!markCounted) {
    incomplete += 1;
    markCounted = true;
  }

  return {
    sessionMarked,
    day: { ...day, incomplete, markCounted },
  };
};

export const applyTimerCompletion = (
  record: StudyRecord,
  phase: StudyPhase,
  now: number,
): StudyRecord => {
  const next = applyCutoff(record, now, 'complete', phase, true);

  // RF-16: los descansos no modifican el resumen diario.
  if (phase !== 'study') return next;

  const day = next.day ?? newDay(now);
  let incomplete = day.incomplete;
  let markCounted = day.markCounted;
  let sessionMarked = next.sessionMarked;

  if (sessionMarked) {
    // RF-15: camino único de la Decisión 009; nunca ambos incrementos.
    sessionMarked = false;
    if (markCounted) {
      incomplete -= 1;
      markCounted = false;
    }
  }

  // RF-14 / RF-15: toda sesión de estudio suma "Completadas" exactamente una vez.
  return {
    sessionMarked,
    day: { ...day, completed: day.completed + 1, incomplete, markCounted },
  };
};

export const deriveSummary = (record: StudyRecord): Summary => {
  if (record.day === null) return { type: 'empty' };
  return {
    type: 'summary',
    completed: record.day.completed,
    incomplete: record.day.incomplete,
    startMs: record.day.startMs,
  };
};
