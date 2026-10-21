import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Fonts, Radii, Shadows, Spacing } from '@/constants/theme';
import { BrandButton } from '@/components/brand-button';
import { BrandDialog } from '@/components/brand-dialog';
import { Skeleton } from '@/components/skeleton';
import { usePomodoroSession } from '@/hooks/use-pomodoro-session';
import { phaseLabel, pomodoroText } from '@/domain/cycle';
import { formatRemaining } from '@/domain/timer';
import {
  hasRequestedNotificationPermission,
  markNotificationPermissionRequested,
} from '@/storage/notifications-permission';
import { requestPermission } from '@/services/notifications';

type IconName = ComponentProps<typeof Ionicons>['name'];

const CONTROL_LABELS: Record<string, string> = {
  start: 'Iniciar',
  pause: 'Pausar',
  resume: 'Continuar',
  reset: 'Reiniciar',
};

const CONTROL_ICONS: Record<string, IconName> = {
  start: 'play',
  pause: 'pause',
  resume: 'play',
  reset: 'refresh',
};

const PHASE_ICONS: Record<string, IconName> = {
  study: 'book',
  shortBreak: 'cafe',
  longBreak: 'moon',
};

// Evita la doble solicitud si el efecto del primer arranque se ejecuta dos
// veces en la misma sesión de JS (montaje doble en desarrollo).
let permissionRequestStarted = false;

const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

export default function HomeScreen() {
  const session = usePomodoroSession();
  const [confirmReset, setConfirmReset] = useState(false);

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

  const onControlPress = useCallback(
    (control: string) => {
      if (control === 'start') session.start();
      else if (control === 'pause') session.pause();
      else if (control === 'resume') session.resume();
      else if (control === 'reset') setConfirmReset(true);
    },
    [session],
  );

  const summary = session.summary;
  const phase = session.cycle.phase;
  const phaseText = phaseLabel(phase);
  const counterText = pomodoroText(session.cycle, session.pomodorosPerCycle);

  const alarmActive = session.alarmActive;
  const alarmContent = session.alarmContent;
  const alarmPhaseText = alarmContent?.endedPhaseLabel ?? phaseText;
  const alarmNextText = alarmContent
    ? `Siguiente: ${alarmContent.nextPhaseLabel}`
    : '';
  // Mientras suena el aviso, la acción se llama "Continuar"; si la fase que
  // terminó fue el descanso largo, el ciclo se cierra y se ofrece "Finalizar"
  // (cambio visual autorizado el 20/10/2026; el comportamiento de detener el
  // aviso y pasar a la siguiente fase es el mismo de la spec 004).
  const cycleCompleted = alarmContent?.endedPhase === 'longBreak';

  // Acota el mostrado al tope vigente: nunca más puntos encendidos que los
  // configurados, aunque el contador real lo supere (cambio de ajuste a mitad
  // de ciclo; RF-09 de la spec 005).
  const shownPomodoros = Math.min(
    session.cycle.pomodoros,
    session.pomodorosPerCycle,
  );
  const dots = Array.from({ length: session.pomodorosPerCycle }, (_, i) => i);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.subtitle}>Es hora de enfocarte en tus estudios</Text>
          </View>
          <View style={styles.headerIcon} accessibilityElementsHidden>
            <Ionicons name="school" size={24} color={Brand.gold} />
          </View>
        </View>

        <View style={styles.timerCard}>
          {!session.loaded ? (
            <View style={styles.skeletonBlock} accessibilityLabel="Cargando temporizador">
              <Skeleton width={160} height={20} />
              <Skeleton width={220} height={64} radius={16} />
              <Skeleton width={200} height={48} radius={24} />
            </View>
          ) : (
            <>
              <View style={styles.progressBlock}>
                <View style={styles.phaseBadge}>
                  <Ionicons
                    name={PHASE_ICONS[phase] ?? 'book'}
                    size={18}
                    color={Brand.gold}
                  />
                  <Text
                    style={styles.phaseText}
                    accessibilityLabel={`Fase actual ${alarmActive ? alarmPhaseText : phaseText}`}
                  >
                    {alarmActive ? alarmPhaseText : phaseText}
                  </Text>
                </View>
                <Text style={styles.counterText} accessibilityLabel={counterText}>
                  {counterText}
                </Text>
                <View style={styles.dotsRow} accessibilityElementsHidden>
                  {dots.map((i) => (
                    <View
                      key={`dot-${i}`}
                      style={[styles.dot, i < shownPomodoros && styles.dotDone]}
                    />
                  ))}
                </View>
              </View>

              {alarmActive ? (
                <View style={styles.alarmBlock}>
                  <Ionicons name="notifications" size={40} color={Brand.gold} />
                  <Text
                    style={styles.alarmTitle}
                    accessibilityLabel={`Aviso activo, fase terminada ${alarmPhaseText}`}
                  >
                    {`${alarmPhaseText} terminado`}
                  </Text>
                  <Text style={styles.alarmNext} accessibilityLabel={alarmNextText}>
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
                  <BrandButton
                    label={cycleCompleted ? 'Finalizar' : 'Continuar'}
                    icon={cycleCompleted ? 'trophy' : 'play'}
                    variant="gold"
                    onPress={session.stopAlarm}
                  />
                ) : (
                  session.controls.map((control) => (
                    <BrandButton
                      key={control}
                      label={CONTROL_LABELS[control] ?? control}
                      icon={CONTROL_ICONS[control]}
                      variant={control === 'reset' ? 'gold' : 'navy'}
                      onPress={() => onControlPress(control)}
                    />
                  ))
                )}
              </View>
            </>
          )}
        </View>

        {session.permissionMessage ? (
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <Ionicons name="notifications-off" size={22} color={Brand.white} />
            </View>
            <Text
              style={styles.permissionText}
              accessibilityLabel={session.permissionMessage}
            >
              {session.permissionMessage}
            </Text>
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          {!session.loaded ? (
            <Skeleton height={40} radius={12} />
          ) : summary.type === 'empty' ? (
            <View style={styles.emptyRow}>
              <Ionicons name="time-outline" size={24} color={Brand.white} />
              <Text style={styles.emptyText}>
                Aún no hay sesiones de estudio registradas.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons name="checkmark-circle" size={24} color={Brand.gold} />
                  <Text style={styles.statValue}>{summary.completed}</Text>
                  <Text style={styles.statLabel}>Completadas</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Ionicons name="close-circle" size={24} color={Brand.white} />
                  <Text style={styles.statValue}>{summary.incomplete}</Text>
                  <Text style={styles.statLabel}>Incompletas</Text>
                </View>
              </View>
              <Text style={styles.lastSession}>
                {`Última sesión de estudio: ${new Date(summary.startMs).toLocaleDateString()}`}
              </Text>
            </>
          )}
        </View>

        {/* [DIAG TEMPORAL] Forzar vencimiento para probar el aviso sin esperar. */}
        <BrandButton
          label="[DIAG] Forzar fin de fase"
          accessibilityLabel="Diagnóstico: forzar fin de fase"
          bordered
          onPress={session.diagForceExpire}
        />
      </ScrollView>

      <BrandDialog
        visible={confirmReset}
        icon="refresh-circle"
        title="¿Reiniciar el temporizador?"
        confirmLabel="Reiniciar"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          session.reset();
        }}
      />
    </SafeAreaView>
  );
}

const GLASS = 'rgba(255, 255, 255, 0.12)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.18)';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.navy,
  },
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  greeting: {
    color: Brand.white,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: Brand.white,
    opacity: 0.7,
    fontSize: 16,
    fontWeight: '400',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCard: {
    backgroundColor: Brand.white,
    borderRadius: Radii.card,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.four,
    ...Shadows.card,
  },
  skeletonBlock: {
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.three,
  },
  progressBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Brand.navy,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
  },
  phaseText: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '700',
  },
  counterText: {
    color: Brand.navy,
    opacity: 0.7,
    fontSize: 16,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Brand.navy,
  },
  dotDone: {
    backgroundColor: Brand.gold,
    borderColor: Brand.gold,
  },
  time: {
    fontFamily: Fonts?.mono,
    fontSize: 64,
    fontWeight: '700',
    color: Brand.navy,
    letterSpacing: 2,
  },
  alarmBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  alarmTitle: {
    color: Brand.navy,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  alarmNext: {
    color: Brand.navy,
    opacity: 0.7,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: Radii.card,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  emptyText: {
    flex: 1,
    color: Brand.white,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  statValue: {
    color: Brand.white,
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    color: Brand.white,
    opacity: 0.7,
    fontSize: 14,
    fontWeight: '400',
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: GLASS_BORDER,
  },
  lastSession: {
    color: Brand.white,
    opacity: 0.7,
    fontSize: 14,
    textAlign: 'center',
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Brand.white,
    borderRadius: Radii.button,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderLeftWidth: 6,
    borderLeftColor: Brand.gold,
    ...Shadows.cardSoft,
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    flex: 1,
    color: Brand.navy,
    fontSize: 16,
  },
});
