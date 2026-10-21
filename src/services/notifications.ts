import { Platform } from 'react-native';
import type * as NotificationsTypes from 'expo-notifications';

import type { NotificationPermissionStatus } from '../domain/alarm';

// Carga segura: en Expo Go falta el módulo nativo y el import lanzaría un error
// que impediría abrir la app. Si no está disponible, los avisos se desactivan.
const loadNotifications = (): typeof NotificationsTypes | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications');
  } catch (error) {
    console.warn('[DIAG] expo-notifications no está disponible en este entorno.', error);
    return null;
  }
};

const Notifications = loadNotifications();

// Identificador del canal Android de alta importancia y vibración.
// El id cambió (v2) porque Android no permite modificar un canal ya creado.
export const ALARM_CHANNEL_ID = 'pomodoro-alarm-v2';

// Patrón de vibración del aviso (RF-01, RF-02).
const VIBRATION_PATTERN = [0, 500, 400, 500, 400, 500];

const notificationContent = (
  N: typeof NotificationsTypes,
  params: { title: string; body: string },
) => ({
  title: params.title,
  body: params.body,
  sound: 'default' as const,
  vibrate: VIBRATION_PATTERN,
  priority: N.AndroidNotificationPriority.MAX,
  sticky: true,
  autoDismiss: false,
});

let handlerConfigured = false;

/**
 * Configura el handler para que la notificación se muestre (banner, lista,
 * sonido y badge) aun cuando la app está en primer plano (RF-08; Decisión 008).
 */
export const configureNotificationHandler = (): void => {
  if (handlerConfigured || !Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  } catch (error) {
    console.warn('[DIAG] No se pudo configurar el handler de notificaciones.', error);
  }
};

/**
 * Crea el canal Android de alta importancia con sonido predeterminado y
 * vibración. El sistema y los ajustes del usuario pueden limitar el aviso.
 */
export const ensureAlarmChannel = async (): Promise<void> => {
  if (!Notifications) return;
  if (Platform.OS !== 'android') {
    console.log('[DIAG] Canal de aviso: no aplica (no es Android).');
    return;
  }
  try {
    const channel = await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: 'Aviso Pomodoro',
      importance: Notifications.AndroidImportance.MAX,
      // Sin la clave `sound`, Android usa el sonido de notificación predeterminado.
      vibrationPattern: VIBRATION_PATTERN,
      enableVibrate: true,
      bypassDnd: false,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    console.log('[DIAG] Canal de aviso creado/actualizado:', {
      id: channel?.id,
      importance: channel?.importance,
      sound: channel?.sound,
      enableVibrate: channel?.enableVibrate,
    });
  } catch (error) {
    console.warn('[DIAG] No se pudo configurar el canal de aviso.', error);
  }
};

const mapStatus = (
  status: NotificationsTypes.NotificationPermissionsStatus,
): NotificationPermissionStatus => {
  if (status?.granted) return 'granted';
  if (status?.status === 'denied' || status?.canAskAgain === false) {
    return 'denied';
  }
  return 'undetermined';
};

/**
 * Estado actual del permiso de notificaciones, mapeado al tipo de dominio
 * (RF-06, RF-07).
 */
export const getPermissionStatus = async (): Promise<NotificationPermissionStatus> => {
  if (!Notifications) return 'denied';
  try {
    const status = await Notifications.getPermissionsAsync();
    console.log('[DIAG] Permiso (get):', {
      granted: status.granted,
      status: status.status,
      canAskAgain: status.canAskAgain,
      iosStatus: status.ios?.status,
    });
    return mapStatus(status);
  } catch (error) {
    console.warn('[DIAG] Falló getPermissionsAsync.', error);
    return 'denied';
  }
};

/**
 * Indica si el sistema todavía puede mostrar el diálogo de solicitud. Si es
 * `false`, el usuario debe habilitar el permiso desde los ajustes (RF-07;
 * Decisión 009).
 */
export const systemCanPrompt = async (): Promise<boolean> => {
  if (!Notifications) return false;
  try {
    const status = await Notifications.getPermissionsAsync();
    return status.canAskAgain;
  } catch (error) {
    console.warn('[DIAG] Falló la consulta de si el sistema puede solicitar permiso.', error);
    return false;
  }
};

/**
 * Solicita el permiso de notificaciones (RF-06). Devuelve el estado resultante.
 */
export const requestPermission =
  async (): Promise<NotificationPermissionStatus> => {
    if (!Notifications) return 'denied';
    try {
      const status = await Notifications.requestPermissionsAsync();
      console.log('[DIAG] Permiso (request):', {
        granted: status.granted,
        status: status.status,
        canAskAgain: status.canAskAgain,
      });
      return mapStatus(status);
    } catch (error) {
      console.warn('[DIAG] Falló requestPermissionsAsync.', error);
      return 'denied';
    }
  };

/**
 * Presenta (o programa de inmediato) la notificación del aviso con sonido,
 * vibración y visibilidad en pantalla de bloqueo (RF-01, RF-02, RF-04).
 * Devuelve el identificador para poder detenerla después.
 */
export const showAlarmNotification = async (params: {
  title: string;
  body: string;
}): Promise<string | null> => {
  if (!Notifications) return null;
  const trigger =
    Platform.OS === 'android'
      ? { channelId: ALARM_CHANNEL_ID }
      : null;
  console.log('[DIAG] Intento mostrar aviso:', {
    platform: Platform.OS,
    title: params.title,
    body: params.body,
    trigger,
  });
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: notificationContent(Notifications, params),
      trigger,
    });
    console.log('[DIAG] Aviso programado con id:', id);
    return id;
  } catch (error) {
    console.warn('[DIAG] No se pudo mostrar el aviso.', error);
    return null;
  }
};

/**
 * Programa el aviso para que el sistema pueda entregarlo aunque la app quede
 * en segundo plano cuando venza el temporizador.
 */
export const scheduleAlarmNotification = async (params: {
  title: string;
  body: string;
  triggerAtMs: number;
}): Promise<string | null> => {
  if (!Notifications) return null;
  const trigger: NotificationsTypes.NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: params.triggerAtMs,
    ...(Platform.OS === 'android' ? { channelId: ALARM_CHANNEL_ID } : {}),
  };
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: notificationContent(Notifications, params),
      trigger,
    });
    console.log('[DIAG] Aviso futuro programado con id:', id);
    return id;
  } catch (error) {
    console.warn('[DIAG] No se pudo programar el aviso futuro.', error);
    return null;
  }
};

export const cancelScheduledAlarmNotification = async (
  identifier: string | null,
): Promise<void> => {
  if (!identifier || !Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.warn('[DIAG] No se pudo cancelar el aviso programado.', error);
  }
};

/**
 * Detiene el aviso: cancela la notificación programada/presentada (RF-05).
 */
export const stopAlarmNotification = async (
  identifier: string | null,
): Promise<void> => {
  if (!Notifications) return;
  try {
    if (identifier) {
      await cancelScheduledAlarmNotification(identifier);
    }
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.warn('[DIAG] No se pudo detener el aviso.', error);
  }
};
