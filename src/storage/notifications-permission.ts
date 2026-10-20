import AsyncStorage from '@react-native-async-storage/async-storage';

// RF-02 (Decisión 001; spec 006): clave nueva y única para recordar entre
// aperturas que la solicitud de permiso de notificaciones ya se hizo. No se
// tocan @pomodoro/settings, @pomodoro/cycle-state ni @pomodoro/study-record
// (Constitución 5).
export const PERMISSION_REQUESTED_KEY = 'notifications.permissionRequestedOnce';

/**
 * Indica si el permiso de notificaciones ya se solicitó alguna vez. Devuelve
 * `false` ante clave ausente, valor inválido o error de AsyncStorage, sin
 * lanzar, para que el primer arranque pueda solicitarlo (RF-02).
 */
export const hasRequestedNotificationPermission = async (): Promise<boolean> => {
  try {
    const raw = await AsyncStorage.getItem(PERMISSION_REQUESTED_KEY);
    if (raw === null) return false;
    return JSON.parse(raw) === true;
  } catch {
    return false;
  }
};

/**
 * Marca la solicitud como realizada. Se guarda aunque el estudiante rechace
 * el permiso, para garantizar que solo se pide una sola vez (RF-02;
 * Decisión 001). No lanza ante errores de AsyncStorage.
 */
export const markNotificationPermissionRequested = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(PERMISSION_REQUESTED_KEY, JSON.stringify(true));
  } catch (error) {
    console.warn('No se pudo guardar el flag de permiso solicitado.', error);
  }
};
