import { useCallback, useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { usePomodoroSession } from '@/hooks/use-pomodoro-session';
import { phaseLabel, pomodoroText } from '@/domain/cycle';
import { formatRemaining } from '@/domain/timer';
import {
  hasRequestedNotificationPermission,
  markNotificationPermissionRequested,
} from '@/storage/notifications-permission';
import { requestPermission } from '@/services/notifications';

const BRAND_NAVY = '#181759';
const BRAND_GOLD = '#C69214';
const BRAND_WHITE = '#FFFFFF';

const CONTROL_LABELS: Record<string, string> = {
  start: 'Iniciar',
  pause: 'Pausar',
  resume: 'Continuar',
  reset: 'Reiniciar',
};

// Evita la doble solicitud si el efecto del primer arranque se ejecuta dos
// veces en la misma sesión de JS (montaje doble en desarrollo).
let permissionRequestStarted = false;

export default function HomeScreen() {
  const session = usePomodoroSession();

  // RF-01 y RF-02 (Decisión 001; spec 006): primer arranque directo al
  // temporizador; el permiso de notificaciones se solicita una sola vez al
  // montar esta pantalla, sin pantallas intermedias de la aplicación (solo el
  // diálogo del sistema). El flag se guarda antes de preguntar para que, aun
  // si la app se cierra durante la solicitud, no vuelva a preguntar (RF-02).
  // Si el estudiante lo rechaza, la pantalla sigue funcionando (RF-03); el
  // bloqueo del inicio por permiso denegado lo aplica RF-07 de la spec 004.
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (permissionRequestStarted) return;
      const alreadyRequested = await hasRequestedNotificationPermission();
      if (!active || alreadyRequested) return;
      permissionRequestStarted = true;
      await markNotificationPermissionRequested();
      await requestPermission();
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const timeText = formatRemaining(session.remaining, session.timer.durationMs);

  const onResetPress = useCallback(() => {
    Alert.alert('¿Reiniciar el temporizador?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reiniciar', style: 'destructive', onPress: () => session.reset() },
    ]);
  }, [session]);

  const onControlPress = useCallback(
    (control: string) => {
      if (control === 'start') session.start();
      else if (control === 'pause') session.pause();
      else if (control === 'resume') session.resume();
      else if (control === 'reset') onResetPress();
    },
    [session, onResetPress],
  );

  const summary = session.summary;
  const phaseText = phaseLabel(session.cycle.phase);
  const counterText = pomodoroText(session.cycle, session.pomodorosPerCycle);

  const alarmActive = session.alarmActive;
  const alarmContent = session.alarmContent;
  const alarmPhaseText = alarmContent?.endedPhaseLabel ?? phaseText;
  const alarmNextText = alarmContent
    ? `Siguiente: ${alarmContent.nextPhaseLabel}`
    : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.timerCard}>
          <View style={styles.progressBlock}>
            <Text
              style={styles.phaseText}
              accessibilityLabel={`Fase actual ${alarmActive ? alarmPhaseText : phaseText}`}
            >
              {alarmActive ? alarmPhaseText : phaseText}
            </Text>
            <Text style={styles.counterText} accessibilityLabel={counterText}>
              {counterText}
            </Text>
          </View>

          {alarmActive ? (
            <View style={styles.alarmBlock}>
              <Text
                style={styles.alarmTitle}
                accessibilityLabel={`Aviso activo, fase terminada ${alarmPhaseText}`}
              >
                {`${alarmPhaseText} terminado`}
              </Text>
              <Text
                style={styles.alarmNext}
                accessibilityLabel={alarmNextText}
              >
                {alarmNextText}
              </Text>
            </View>
          ) : (
            <Text style={styles.time} accessibilityLabel={`Tiempo restante ${timeText}`}>
              {timeText}
            </Text>
          )}

          <View style={styles.controlsRow}>
            {alarmActive ? (
              <Pressable
                onPress={session.stopAlarm}
                accessibilityRole="button"
                accessibilityLabel="Detener"
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonGold,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.buttonLabel}>Detener</Text>
              </Pressable>
            ) : (
              session.controls.map((control) => (
                <Pressable
                  key={control}
                  onPress={() => onControlPress(control)}
                  accessibilityRole="button"
                  accessibilityLabel={CONTROL_LABELS[control] ?? control}
                  style={({ pressed }) => [
                    styles.button,
                    control === 'reset' ? styles.buttonGold : styles.buttonNavy,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.buttonLabel}>{CONTROL_LABELS[control] ?? control}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>

        {session.permissionMessage ? (
          <View style={styles.permissionCard}>
            <Text
              style={styles.permissionText}
              accessibilityLabel={session.permissionMessage}
            >
              {session.permissionMessage}
            </Text>
          </View>
        ) : null}

        {/* [DIAG TEMPORAL] Forzar vencimiento para probar el aviso sin esperar. */}
        <Pressable
          onPress={session.diagForceExpire}
          accessibilityRole="button"
          accessibilityLabel="Diagnóstico: forzar fin de fase"
          style={({ pressed }) => [
            styles.button,
            styles.diagButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonLabel}>[DIAG] Forzar fin de fase</Text>
        </Pressable>

        <View style={styles.summaryCard}>
          {summary.type === 'empty' ? (
            <Text style={styles.summaryText}>Aún no hay sesiones de estudio registradas.</Text>
          ) : (
            <Text style={styles.summaryText}>
              {`Completadas: ${summary.completed} · Incompletas: ${summary.incomplete} · Última sesión de estudio: ${new Date(summary.startMs).toLocaleDateString()}`}
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_NAVY,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 24,
    justifyContent: 'center',
  },
  timerCard: {
    backgroundColor: BRAND_WHITE,
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 32,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  progressBlock: {
    alignItems: 'center',
    gap: 4,
  },
  phaseText: {
    color: BRAND_NAVY,
    fontSize: 20,
    fontWeight: '700',
  },
  counterText: {
    color: BRAND_GOLD,
    fontSize: 18,
    fontWeight: '600',
  },
  time: {
    fontFamily: Fonts?.mono,
    fontSize: 64,
    fontWeight: '700',
    color: BRAND_NAVY,
    letterSpacing: 2,
  },
  alarmBlock: {
    alignItems: 'center',
    gap: 8,
  },
  alarmTitle: {
    color: BRAND_NAVY,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  alarmNext: {
    color: BRAND_GOLD,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    minWidth: 120,
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonNavy: {
    backgroundColor: BRAND_NAVY,
  },
  buttonGold: {
    backgroundColor: BRAND_GOLD,
  },
  diagButton: {
    backgroundColor: BRAND_NAVY,
    borderWidth: 2,
    borderColor: BRAND_GOLD,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonLabel: {
    color: BRAND_WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: BRAND_WHITE,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  permissionCard: {
    backgroundColor: BRAND_WHITE,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: BRAND_GOLD,
  },
  permissionText: {
    color: BRAND_NAVY,
    fontSize: 16,
    textAlign: 'center',
  },
  summaryText: {
    color: BRAND_NAVY,
    fontSize: 16,
    textAlign: 'center',
  },
});
