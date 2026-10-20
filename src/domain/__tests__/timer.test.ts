import { expect, describe, it } from '@jest/globals';
import {
  createTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  remainingMs,
  tick,
  formatRemaining,
  controlsFor,
} from '../timer';

describe('timer', () => {
  it('starts from initial using configured duration and shows remaining', () => {
    const duration = 25 * 60 * 1000;
    const timer = createTimer(duration);
    const started = startTimer(timer, 1000);
    expect(remainingMs(started, 1000)).toBe(duration);
  });

  it('pauses and continues without losing time', () => {
    const duration = 25 * 60 * 1000;
    let t = createTimer(duration);
    t = startTimer(t, 0);
    // after 5 seconds
    t = tick(pauseTimer(t, 5000), 5000);
    expect(remainingMs(t, 5000)).toBe(duration - 5000);
    t = resumeTimer(t, 10000);
    expect(remainingMs(t, 10000)).toBe(duration - 5000);
    // after another 3 seconds
    const now = 13000;
    const rem = remainingMs(t, now);
    expect(rem).toBe(duration - 5000 - 3000);
  });

  it('pauses and resumes multiple times without losing time', () => {
    const duration = 10000;
    let t = createTimer(duration);
    t = startTimer(t, 0);
    t = pauseTimer(t, 1000); // paused at 1s elapsed
    t = resumeTimer(t, 5000);
    t = pauseTimer(t, 6000); // elapsed 1s more (total 2s)
    t = resumeTimer(t, 8000);
    expect(remainingMs(t, 9000)).toBe(duration - 3000);
  });

  it('reset returns to initial time', () => {
    const duration = 25 * 60 * 1000;
    let t = createTimer(duration);
    t = startTimer(t, 0);
    t = pauseTimer(t, 5000);
    t = resetTimer(t);
    expect(t.state).toBe('initial');
    expect(remainingMs(t, 10000)).toBe(duration);
  });

  it('controlsFor matches states and is same for study/breaks', () => {
    expect(controlsFor('initial')).toEqual(['start']);
    expect(controlsFor('running')).toEqual(['pause', 'reset']);
    expect(controlsFor('paused')).toEqual(['resume', 'reset']);
    expect(controlsFor('finished')).toEqual(['reset']);
  });

  it('reaches 00:00 => finished with no pause control and remaining 0', () => {
    const duration = 1000;
    let t = createTimer(duration);
    t = startTimer(t, 0);
    t = tick(t, 1000);
    expect(t.state).toBe('finished');
    expect(t.remainingMs).toBe(0);
    expect(controlsFor(t.state)).toEqual(['reset']);
  });

  it('formatRemaining works for MM:SS and HH:MM:SS when >=60min', () => {
    const duration25 = 25 * 60 * 1000;
    expect(formatRemaining(duration25, duration25)).toBe('25:00');
    expect(formatRemaining(5000, duration25)).toBe('00:05');
    expect(formatRemaining(61000, duration25)).toBe('01:01');
    const duration60 = 60 * 60 * 1000;
    expect(formatRemaining(duration60, duration60)).toBe('01:00:00');
    expect(formatRemaining(3661000, duration60)).toBe('01:01:01');
  });
});
