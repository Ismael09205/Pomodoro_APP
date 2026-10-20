import { DEFAULT_PHASE_DURATIONS } from './config';

export type TimerState = 'initial' | 'running' | 'paused' | 'finished';

export type TimerControl = 'start' | 'pause' | 'resume' | 'reset';

export type Timer = {
  state: TimerState;
  durationMs: number;
  remainingMs: number;
  runningSinceMs: number | null;
};

export const createTimer = (durationMs: number): Timer => {
  return {
    state: 'initial',
    durationMs,
    remainingMs: durationMs,
    runningSinceMs: null,
  };
};

export const startTimer = (t: Timer, now: number): Timer => {
  if (t.state !== 'initial') return t;
  return {
    ...t,
    state: 'running',
    runningSinceMs: now,
  };
};

export const resumeTimer = (t: Timer, now: number): Timer => {
  if (t.state !== 'paused') return t;
  return {
    ...t,
    state: 'running',
    runningSinceMs: now,
  };
};

export const pauseTimer = (t: Timer, now: number): Timer => {
  if (t.state !== 'running') return t;
  const remaining = remainingMs(t, now);
  return {
    ...t,
    state: 'paused',
    remainingMs: remaining,
    runningSinceMs: null,
  };
};

export const resetTimer = (t: Timer): Timer => {
  return {
    ...t,
    state: 'initial',
    remainingMs: t.durationMs,
    runningSinceMs: null,
  };
};

export const remainingMs = (t: Timer, now: number): number => {
  if (t.state !== 'running' || t.runningSinceMs === null) {
    return t.remainingMs;
  }
  const consumed = now - t.runningSinceMs;
  const result = t.remainingMs - consumed;
  return result > 0 ? result : 0;
};

export const tick = (t: Timer, now: number): Timer => {
  if (t.state === 'running' || t.state === 'paused' || t.state === 'finished') {
    const remaining = remainingMs(t, now);
    if (remaining === 0 && t.state === 'running') {
      return {
        ...t,
        state: 'finished',
        remainingMs: 0,
        runningSinceMs: null,
      };
    }
    if (t.state === 'running') {
      return { ...t, remainingMs: remaining };
    }
  }
  return t;
};

export const formatRemaining = (remainingMsVal: number, durationMsVal: number): string => {
  const totalSeconds = Math.floor(remainingMsVal / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (durationMsVal >= 60 * 60 * 1000) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const controlsFor = (state: TimerState): TimerControl[] => {
  switch (state) {
    case 'initial':
      return ['start'];
    case 'running':
      return ['pause', 'reset'];
    case 'paused':
      return ['resume', 'reset'];
    case 'finished':
      return ['reset'];
    default:
      return ['start'];
  }
};

export const DEFAULT_STUDY_DURATION_MS = DEFAULT_PHASE_DURATIONS.studyMs;
