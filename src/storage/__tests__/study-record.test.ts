import { expect, describe, it, beforeEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { emptyStudyRecord, applyTimerStart } from '../../domain/session-record';
import { loadStudyRecord, saveStudyRecord, STUDY_RECORD_KEY } from '../study-record';

describe('storage/study-record', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('roundtrip guardar/recuperar produce el mismo registro', async () => {
    const record = applyTimerStart(emptyStudyRecord(), 'study', 1760000000000);
    await saveStudyRecord(record);
    const loaded = await loadStudyRecord();
    expect(loaded).toEqual(record);
  });

  it('sin dato previo devuelve emptyStudyRecord()', async () => {
    const loaded = await loadStudyRecord();
    expect(loaded).toEqual(emptyStudyRecord());
  });

  it('JSON inválido devuelve registro vacío sin lanzar', async () => {
    await AsyncStorage.setItem(STUDY_RECORD_KEY, '{no-es-json');
    const loaded = await loadStudyRecord();
    expect(loaded).toEqual(emptyStudyRecord());
  });
});
