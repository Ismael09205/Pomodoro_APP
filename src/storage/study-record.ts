import AsyncStorage from '@react-native-async-storage/async-storage';

import { emptyStudyRecord, type StudyRecord } from '../domain/session-record';

export const STUDY_RECORD_KEY = '@pomodoro/study-record';

const CURRENT_VERSION = 1;

type StoredStudyRecord = {
  version: number;
  record: StudyRecord;
};

export const loadStudyRecord = async (): Promise<StudyRecord> => {
  try {
    const raw = await AsyncStorage.getItem(STUDY_RECORD_KEY);
    if (raw === null) return emptyStudyRecord();
    const parsed = JSON.parse(raw) as StoredStudyRecord;
    if (!parsed || typeof parsed !== 'object' || !parsed.record) {
      return emptyStudyRecord();
    }
    return parsed.record;
  } catch {
    return emptyStudyRecord();
  }
};

export const saveStudyRecord = async (record: StudyRecord): Promise<void> => {
  const payload: StoredStudyRecord = {
    version: CURRENT_VERSION,
    record,
  };
  try {
    await AsyncStorage.setItem(STUDY_RECORD_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('No se pudo guardar el registro de estudio.', error);
  }
};
