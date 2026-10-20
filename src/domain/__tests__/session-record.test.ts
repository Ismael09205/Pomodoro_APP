import { expect, describe, it } from '@jest/globals';
import {
  emptyStudyRecord,
  newDay,
  applyTimerStart,
  applyTimerReset,
  applyTimerCompletion,
  deriveSummary,
} from '../session-record';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe('session-record: marca de sesión incompleta (T3)', () => {
  it('reiniciar estudio desde Corriendo o Pausado suma una sola incompleta aunque se repita el ciclo', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    record = applyTimerReset(record, 'study', 'running', 1000);
    expect(record.sessionMarked).toBe(true);
    expect(record.day?.incomplete).toBe(1);

    // repeat cycle: start again, then reset while running
    record = applyTimerStart(record, 'study', 2000);
    record = applyTimerReset(record, 'study', 'running', 3000);
    expect(record.day?.incomplete).toBe(1);
  });

  it('reiniciar desde Finalizado no modifica el registro', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    record = applyTimerCompletion(record, 'study', 1000);
    const before = JSON.stringify(record);
    record = applyTimerReset(record, 'study', 'finished', 2000);
    expect(JSON.stringify(record)).toBe(before);
  });

  it('reiniciar un descanso no modifica el registro', () => {
    const record = emptyStudyRecord();
    const reset = applyTimerReset(record, 'shortBreak', 'running', 1000);
    expect(reset).toEqual(record);
  });

  it('completar la sesión marcada retira la marca sin crear sesión nueva (RF-15, Decisión 009)', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    record = applyTimerReset(record, 'study', 'running', 1000);
    const dayStart = record.day?.startMs;
    record = applyTimerStart(record, 'study', 2000);
    record = applyTimerCompletion(record, 'study', 3000);
    expect(record.sessionMarked).toBe(false);
    expect(record.day?.incomplete).toBe(0);
    expect(record.day?.completed).toBe(1);
    expect(record.day?.startMs).toBe(dayStart);
  });
});

describe('session-record: incremento de "Completadas" en el 00:00 (T2)', () => {
  it('completar un estudio sin marca incrementa completed exactamente una vez (RF-14)', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    record = applyTimerCompletion(record, 'study', 1000);
    expect(record.day?.completed).toBe(1);
    expect(record.day?.incomplete).toBe(0);
    expect(record.sessionMarked).toBe(false);
  });

  it('completar un estudio marcado suma 1 a completed y resta 1 a incomplete, sin sesión nueva (RF-15)', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    record = applyTimerReset(record, 'study', 'running', 1000);
    expect(record.day?.incomplete).toBe(1);
    record = applyTimerStart(record, 'study', 2000);
    record = applyTimerCompletion(record, 'study', 3000);
    // Camino único de la Decisión 009: nunca ambos incrementos.
    expect(record.day?.completed).toBe(1);
    expect(record.day?.incomplete).toBe(0);
    expect(record.day?.startMs).toBe(0);
  });

  it('completar un descanso corto no modifica el registro (RF-16)', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    record = applyTimerCompletion(record, 'study', 1000);
    const before = JSON.stringify(record);
    const after = applyTimerCompletion(record, 'shortBreak', 2000);
    expect(JSON.stringify(after)).toBe(before);
  });

  it('completar un descanso largo no modifica el registro (RF-16)', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    record = applyTimerCompletion(record, 'study', 1000);
    const before = JSON.stringify(record);
    const after = applyTimerCompletion(record, 'longBreak', 2000);
    expect(JSON.stringify(after)).toBe(before);
  });

  it('reiniciar un descanso no altera el registro con sesiones completadas (RF-12)', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    record = applyTimerCompletion(record, 'study', 1000);
    const before = JSON.stringify(record);
    const after = applyTimerReset(record, 'shortBreak', 'running', 5000);
    expect(JSON.stringify(after)).toBe(before);
  });
});

describe('session-record: día de uso y resumen (T4)', () => {
  it('el primer inicio de estudio crea el día', () => {
    const record = applyTimerStart(emptyStudyRecord(), 'study', 5000);
    expect(record.day?.startMs).toBe(5000);
    expect(record.day?.completed).toBe(0);
    expect(record.day?.incomplete).toBe(0);
  });

  it('sin día, deriveSummary devuelve el estado vacío', () => {
    expect(deriveSummary(emptyStudyRecord())).toEqual({ type: 'empty' });
  });

  it('corte vencido sin sesión en curso conserva contadores y fecha hasta el siguiente iniciar, que crea día nuevo a cero', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    record = applyTimerReset(record, 'study', 'running', 1000);
    expect(record.day?.incomplete).toBe(1);

    // 24h passed; a reset from finished / no session keeps the record
    const afterCutoff = applyTimerReset(record, 'study', 'finished', DAY + 5000);
    expect(afterCutoff.day?.startMs).toBe(0);
    expect(afterCutoff.day?.incomplete).toBe(1);

    // next start creates a new day at zero
    const newRecord = applyTimerStart(afterCutoff, 'study', DAY + 6000);
    expect(newRecord.day?.startMs).toBe(DAY + 6000);
    expect(newRecord.day?.completed).toBe(0);
    expect(newRecord.day?.incomplete).toBe(0);
  });

  it('corte con sesión de estudio en curso no cambia nada hasta completar; entonces el día nace en ese instante con la sesión contabilizada', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    // session still running when cutoff passes; the record keeps the old day
    // until the session completes (RF-17).
    expect(record.day?.startMs).toBe(0);

    // complete the in-progress session after cutoff => new day born at that
    // instant with the session counted as completed (RF-14).
    const completed = applyTimerCompletion(record, 'study', DAY + 2000);
    expect(completed.day?.startMs).toBe(DAY + 2000);
    expect(completed.day?.completed).toBe(1);
    expect(completed.day?.incomplete).toBe(0);
  });

  it('corte con sesión en curso y reinicio: nace día nuevo en ese instante con la incompleta contabilizada', () => {
    let record = emptyStudyRecord();
    record = applyTimerStart(record, 'study', 0);
    const reset = applyTimerReset(record, 'study', 'running', DAY + 3000);
    expect(reset.day?.startMs).toBe(DAY + 3000);
    expect(reset.day?.incomplete).toBe(1);
    expect(reset.sessionMarked).toBe(true);
  });
});
