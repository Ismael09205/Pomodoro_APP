import { expect, describe, it, beforeEach, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CYCLE_STATE_KEY } from '../cycle-state';
import {
  PERMISSION_REQUESTED_KEY,
  hasRequestedNotificationPermission,
  markNotificationPermissionRequested,
} from '../notifications-permission';
import { SETTINGS_KEY } from '../settings';
import { STUDY_RECORD_KEY } from '../study-record';

// RF-02 (Decisión 001; spec 006): el flag recuerda entre aperturas que la
// solicitud de permiso de notificaciones ya se hizo, sin cambiar el formato
// de los datos existentes (Constitución 5).
describe('storage/notifications-permission', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it('sin dato previo devuelve false: el permiso aún no se ha solicitado (RF-02)', async () => {
    expect(await hasRequestedNotificationPermission()).toBe(false);
  });

  it('tras marcar la solicitud, devuelve true (RF-02)', async () => {
    await markNotificationPermissionRequested();
    expect(await hasRequestedNotificationPermission()).toBe(true);
  });

  it('usa la clave exacta notifications.permissionRequestedOnce (RF-02)', async () => {
    await markNotificationPermissionRequested();
    const raw = await AsyncStorage.getItem(PERMISSION_REQUESTED_KEY);
    expect(PERMISSION_REQUESTED_KEY).toBe('notifications.permissionRequestedOnce');
    expect(raw).toBe(JSON.stringify(true));
  });

  it('marcar dos veces seguidas sigue devolviendo true', async () => {
    await markNotificationPermissionRequested();
    await markNotificationPermissionRequested();
    expect(await hasRequestedNotificationPermission()).toBe(true);
  });

  it('un valor inválido en la clave devuelve false sin lanzar', async () => {
    await AsyncStorage.setItem(PERMISSION_REQUESTED_KEY, 'no-es-un-booleano');
    expect(await hasRequestedNotificationPermission()).toBe(false);
    await AsyncStorage.setItem(PERMISSION_REQUESTED_KEY, JSON.stringify('basura'));
    expect(await hasRequestedNotificationPermission()).toBe(false);
    await AsyncStorage.setItem(PERMISSION_REQUESTED_KEY, JSON.stringify({ version: 1 }));
    expect(await hasRequestedNotificationPermission()).toBe(false);
  });

  it('si AsyncStorage falla al leer devuelve false sin lanzar', async () => {
    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('fallo de storage'));
    await expect(hasRequestedNotificationPermission()).resolves.toBe(false);
  });

  it('si AsyncStorage falla al escribir no lanza y la lectura sigue devolviendo false', async () => {
    jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('fallo de storage'));
    await expect(markNotificationPermissionRequested()).resolves.toBeUndefined();
    expect(await hasRequestedNotificationPermission()).toBe(false);
  });

  it('el flag no altera @pomodoro/settings, @pomodoro/cycle-state ni @pomodoro/study-record (Constitución 5)', async () => {
    const settingsPayload = JSON.stringify({
      version: 1,
      studyMinutes: 45,
      shortBreakMinutes: 10,
      longBreakMinutes: 20,
      pomodorosPerCycle: 3,
    });
    const cyclePayload = JSON.stringify({
      version: 2,
      cycle: { phase: 'study', pomodoros: 2 },
      timer: null,
    });
    const recordPayload = JSON.stringify({
      version: 1,
      record: { day: null, sessionMarked: false },
    });
    await AsyncStorage.setItem(SETTINGS_KEY, settingsPayload);
    await AsyncStorage.setItem(CYCLE_STATE_KEY, cyclePayload);
    await AsyncStorage.setItem(STUDY_RECORD_KEY, recordPayload);

    await markNotificationPermissionRequested();

    expect(await AsyncStorage.getItem(SETTINGS_KEY)).toBe(settingsPayload);
    expect(await AsyncStorage.getItem(CYCLE_STATE_KEY)).toBe(cyclePayload);
    expect(await AsyncStorage.getItem(STUDY_RECORD_KEY)).toBe(recordPayload);
  });
});
