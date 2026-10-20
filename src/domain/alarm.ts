import type { StudyPhase } from './session-record';
import { phaseLabel } from './cycle';

export type AlarmState = 'idle' | 'active';

export type AlarmContent = {
  title: string;
  body: string;
  endedPhaseLabel: string;
  nextPhaseLabel: string;
};

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export const getAlarmContent = (
  endedPhase: StudyPhase,
  nextPhase: StudyPhase,
): AlarmContent => {
  const endedPhaseLabel = phaseLabel(endedPhase);
  const nextPhaseLabel = phaseLabel(nextPhase);
  return {
    title: `${endedPhaseLabel} terminado`,
    body: `Siguiente: ${nextPhaseLabel}`,
    endedPhaseLabel,
    nextPhaseLabel,
  };
};

export const shouldRequestNotificationPermissionOnFirstStudyStart = (params: {
  phase: StudyPhase;
  permissionRequestedBefore: boolean;
}): boolean => {
  if (params.permissionRequestedBefore) {
    return false;
  }
  if (params.phase === 'study') {
    return true;
  }
  return false;
};

export const canStartTimerWithPermission = (
  status: NotificationPermissionStatus,
): { allowed: boolean; reason?: 'denied' } => {
  if (status === 'denied') {
    return { allowed: false, reason: 'denied' };
  }
  return { allowed: true };
};

export const getPermissionRetryGuidance = (
  status: NotificationPermissionStatus,
  systemCanPrompt: boolean,
): { action: 'retry' | 'openSettings' | 'none'; message: string } => {
  if (status === 'granted') {
    return { action: 'none', message: '' };
  }
  if (status === 'undetermined' && systemCanPrompt) {
    return {
      action: 'retry',
      message: 'Se necesita permiso de notificaciones para recibir el aviso al finalizar la fase.',
    };
  }
  if (status === 'denied' || (status === 'undetermined' && !systemCanPrompt)) {
    return {
      action: 'openSettings',
      message: 'Habilita las notificaciones en los ajustes del sistema para recibir el aviso al finalizar la fase.',
    };
  }
  return { action: 'none', message: '' };
};

export const alarmStopAdvancesToNext = (): boolean => {
  return true;
};
