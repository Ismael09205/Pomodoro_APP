import {
  alarmStopAdvancesToNext,
  canStartTimerWithPermission,
  getAlarmContent,
  getPermissionRetryGuidance,
  shouldRequestNotificationPermissionOnFirstStudyStart,
} from '../alarm';

describe('domain/alarm', () => {
  it('getAlarmContent incluye fase terminada y siguiente fase', () => {
    const content = getAlarmContent('study', 'shortBreak');
    expect(content.endedPhase).toBe('study');
    expect(content.endedPhaseLabel).toBe('Estudio');
    expect(content.nextPhaseLabel).toBe('Descanso corto');
    expect(content.body).toContain('Descanso corto');
    expect(content.title).toContain('Estudio');
  });

  it('shouldRequestNotificationPermissionOnFirstStudyStart solo true en primer inicio de estudio', () => {
    expect(
      shouldRequestNotificationPermissionOnFirstStudyStart({
        phase: 'study',
        permissionRequestedBefore: false,
      }),
    ).toBe(true);
    expect(
      shouldRequestNotificationPermissionOnFirstStudyStart({
        phase: 'study',
        permissionRequestedBefore: true,
      }),
    ).toBe(false);
    expect(
      shouldRequestNotificationPermissionOnFirstStudyStart({
        phase: 'shortBreak',
        permissionRequestedBefore: false,
      }),
    ).toBe(false);
  });

  it('canStartTimerWithPermission bloquea si denegado', () => {
    expect(canStartTimerWithPermission('denied')).toEqual({
      allowed: false,
      reason: 'denied',
    });
    expect(canStartTimerWithPermission('granted')).toEqual({ allowed: true });
    expect(canStartTimerWithPermission('undetermined')).toEqual({ allowed: true });
  });

  it('getPermissionRetryGuidance reintenta desde app o guía a ajustes', () => {
    expect(getPermissionRetryGuidance('undetermined', true).action).toBe('retry');
    expect(getPermissionRetryGuidance('denied', true).action).toBe('openSettings');
    expect(getPermissionRetryGuidance('undetermined', false).action).toBe('openSettings');
    expect(getPermissionRetryGuidance('granted', true).action).toBe('none');
  });

  it('alarmStopAdvancesToNext confirma que detener avanza la fase (Decisión 004)', () => {
    expect(alarmStopAdvancesToNext()).toBe(true);
  });

  it('getAlarmContent cubre las tres fases terminadas', () => {
    expect(getAlarmContent('study', 'shortBreak').title).toBe('Estudio terminado');
    expect(getAlarmContent('shortBreak', 'study').title).toBe('Descanso corto terminado');
    expect(getAlarmContent('longBreak', 'study').title).toBe('Descanso largo terminado');
  });

  it('getAlarmContent expone la fase terminada, que cierra el ciclo al ser el descanso largo', () => {
    expect(getAlarmContent('study', 'shortBreak').endedPhase).toBe('study');
    expect(getAlarmContent('shortBreak', 'study').endedPhase).toBe('shortBreak');
    expect(getAlarmContent('longBreak', 'study').endedPhase).toBe('longBreak');
  });
});
