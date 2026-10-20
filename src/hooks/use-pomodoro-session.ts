import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  canStartTimerWithPermission,
  getAlarmContent,
  getPermissionRetryGuidance,
  type AlarmContent,
  type NotificationPermissionStatus,
} from '../domain/alarm';
import {
  advanceCycle,
  durationForPhase,
  emptyCycle,
  nextTimerFor,
  type CycleState,
} from '../domain/cycle';
import { DEFAULT_SETTINGS, type PomodoroSettings } from '../domain/settings';
import {
  applyTimerCompletion,
  applyTimerReset,
  applyTimerStart,
  deriveSummary,
  emptyStudyRecord,
  type StudyPhase,
  type StudyRecord,
  type Summary,
} from '../domain/session-record';
import { evaluateTimer, recoverSession } from '../domain/session-recovery';
import {
  controlsFor,
  createTimer,
  pauseTimer,
  remainingMs,
  resetTimer,
  resumeTimer,
  startTimer,
  type Timer,
  type TimerControl,
} from '../domain/timer';
import {
  configureNotificationHandler,
  cancelScheduledAlarmNotification,
  ensureAlarmChannel,
  getPermissionStatus,
  scheduleAlarmNotification,
  showAlarmNotification,
  stopAlarmNotification,
  systemCanPrompt,
} from '../services/notifications';
import { loadCycleState, saveCycleState } from '../storage/cycle-state';
import { loadStudyRecord, saveStudyRecord } from '../storage/study-record';
import { useSettings } from './use-settings';

const REFRESH_INTERVAL_MS = 500;

export type PomodoroSession = {
  cycle: CycleState;
  timer: Timer;
  remaining: number;
  controls: TimerControl[];
  summary: Summary;
  loaded: boolean;
  // Cantidad de pomodoros por ciclo vigente (RF-09; Constitución 11).
  pomodorosPerCycle: number;
  // Estado de aviso activo (RF-04, RF-09): mientras es cierto, la pantalla
  // muestra "fase terminada / aviso activo" sin contador y con "Detener".
  alarmActive: boolean;
  alarmContent: AlarmContent | null;
  // Mensaje de permiso de notificaciones pendiente (RF-06, RF-07), si lo hay.
  permissionMessage: string | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stopAlarm: () => void;
  // [DIAG TEMPORAL] Fuerza el vencimiento de la fase para probar el aviso sin
  // esperar. Se elimina al cerrar el diagnóstico.
  diagForceExpire: () => void;
};

// Camino único de vencimiento (spec 002): se reutiliza con la app abierta y
// con el vencimiento recuperado al reabrir (RF-08, RF-09; Decisión 007).
// Usa los ajustes vigentes: el contador avanza con settings.pomodorosPerCycle
// y la siguiente fase nace con su duración configurada (RF-02, RF-09).
const completionFor = (
  record: StudyRecord,
  cycle: CycleState,
  now: number,
  settings: PomodoroSettings,
): { nextRecord: StudyRecord; nextCycle: CycleState; nextTimer: Timer } => {
  const nextRecord = applyTimerCompletion(record, cycle.phase, now);
  const nextCycle = advanceCycle(cycle, settings.pomodorosPerCycle);
  const nextTimer = nextTimerFor(nextCycle, settings);
  return { nextRecord, nextCycle, nextTimer };
};

export const usePomodoroSession = (): PomodoroSession => {
  // Ajustes vigentes desde el contexto compartido (RF-02, RF-07, RF-09).
  const { settings, loaded: settingsLoaded } = useSettings();
  const [cycle, setCycle] = useState<CycleState>(() => emptyCycle());
  const [timer, setTimer] = useState<Timer>(() =>
    createTimer(durationForPhase(emptyCycle().phase, DEFAULT_SETTINGS)),
  );
  const [record, setRecord] = useState<StudyRecord>(() => emptyStudyRecord());
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());
  // Aviso activo (RF-04, RF-09) y su contenido (RF-03).
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmContent, setAlarmContent] = useState<AlarmContent | null>(null);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);

  const timerRef = useRef(timer);
  timerRef.current = timer;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const recordRef = useRef(record);
  recordRef.current = record;
  const cycleRef = useRef(cycle);
  cycleRef.current = cycle;
  // Fase terminada mientras el aviso está activo; la siguiente fase se aplica
  // solo al pulsar "Detener" (RF-09; Decisión 010).
  const pendingPhaseRef = useRef<StudyPhase | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const scheduledNotificationIdRef = useRef<string | null>(null);

  const persistRecord = useCallback((next: StudyRecord) => {
    void saveStudyRecord(next);
  }, []);

  // DT-4: la persistencia ocurre solo en transiciones (iniciar, pausar,
  // continuar, reiniciar y 00:00), nunca de forma periódica (RF-05).
  const persistSession = useCallback(
    (next: { cycle: CycleState; timer: Timer }) => {
      void saveCycleState(next);
    },
    [],
  );

  // Procesa el vencimiento (normal o por salto anómalo) con la hora del
  // suceso (RF-08; Decisión 007). Calcula el camino único de transición
  // (applyTimerCompletion + advanceCycle) y lo deja PENDIENTE: el aviso se
  // activa y la siguiente fase se aplica solo al pulsar "Detener" (RF-05,
  // RF-09; Decisiones 004, 010).
  const completePhase = useCallback(
    (currentNow: number) => {
      const endedPhase = cycleRef.current.phase;
      console.log('[DIAG] completePhase(): vencimiento detectado', {
        endedPhase,
        currentNow,
        timerState: timerRef.current.state,
        remaining: timerRef.current.remainingMs,
      });
      const { nextRecord, nextCycle, nextTimer } = completionFor(
        recordRef.current,
        cycleRef.current,
        currentNow,
        settingsRef.current,
      );
      // Se conserva la fase terminada mientras el aviso está activo.
      pendingPhaseRef.current = endedPhase;
      setRecord(nextRecord);
      setCycle(nextCycle);
      setTimer(nextTimer);
      persistRecord(nextRecord);
      persistSession({ cycle: nextCycle, timer: nextTimer });

      const content = getAlarmContent(endedPhase, nextCycle.phase);
      setAlarmContent(content);
      setAlarmActive(true);

      const scheduledId = scheduledNotificationIdRef.current;
      if (scheduledId) {
        notificationIdRef.current = scheduledId;
        scheduledNotificationIdRef.current = null;
      } else {
        void ensureAlarmChannel().then(() =>
          showAlarmNotification({
            title: content.title,
            body: content.body,
          }).then((id) => {
            notificationIdRef.current = id;
          }),
        );
      }
    },
    [persistRecord, persistSession],
  );

  // Carga al montar, tras cargar los ajustes: fase + contador + temporizador
  // junto con el registro. Si la fase Corriendo venció con la app cerrada o el
  // celular bloqueado, el vencimiento se procesa una sola vez con la hora de
  // reapertura (RF-01, RF-03, RF-08, RF-09; Decisión 007). Una fase Pausada se
  // conserva congelada, sin reanudar y sin aviso (RF-06, RF-07; Decisión 005).
  // El temporizador inicial se reconstruye con la duración configurada
  // (RF-02, RF-03).
  useEffect(() => {
    if (!settingsLoaded) return;
    let active = true;
    Promise.all([loadStudyRecord(), loadCycleState()]).then(
      ([storedRecord, stored]) => {
        if (!active) return;
        const outcome = recoverSession(
          stored,
          Date.now(),
          settingsRef.current,
        );
        if (outcome.action === 'complete') {
          const currentNow = Date.now();
          const endedPhase = stored.cycle.phase;
          const { nextRecord, nextCycle, nextTimer } = completionFor(
            storedRecord,
            stored.cycle,
            currentNow,
            settingsRef.current,
          );
          setRecord(nextRecord);
          setCycle(nextCycle);
          setTimer(nextTimer);
          persistRecord(nextRecord);
          persistSession({ cycle: nextCycle, timer: nextTimer });

          // El vencimiento ocurrido con la app en segundo plano emite el aviso
          // (RF-08) y deja la fase pendiente hasta "Detener" (RF-09).
          pendingPhaseRef.current = endedPhase;
          const content = getAlarmContent(endedPhase, nextCycle.phase);
          setAlarmContent(content);
          setAlarmActive(true);
          void ensureAlarmChannel().then(() =>
            showAlarmNotification({
              title: content.title,
              body: content.body,
            }).then((id) => {
              notificationIdRef.current = id;
            }),
          );
        } else {
          setRecord(storedRecord);
          setCycle(stored.cycle);
          setTimer(outcome.timer);
        }
        setLoaded(true);
      },
    );
    return () => {
      active = false;
    };
  }, [persistRecord, persistSession, settingsLoaded]);

  // Reloj con la app abierta: el restante se deriva del reloj del dispositivo
  // en cada actualización (RF-04); no se guardan ticks intermedios.
  useEffect(() => {
    if (timer.state !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [timer.state]);

  // Vencimiento con la app abierta: mismo camino único que al reabrir; el
  // salto anómalo del reloj con la fase Corriendo da el mismo resultado
  // (RF-08, RF-11; Decisión 003). Con Pausada o Inicial no hay vencimiento
  // que procesar (RF-12).
  useEffect(() => {
    if (!loaded) return;

    const current = timerRef.current;
    if (current.state !== 'running') return;

    const currentNow = Date.now();
    const evaluation = evaluateTimer(current, currentNow);
    if (evaluation.kind === 'running') return;

    console.log('[DIAG] useEffect vencimiento (primer plano):', {
      kind: evaluation.kind,
    });
    completePhase(currentNow);
  }, [loaded, now, completePhase]);

  // Al volver al frente se recalcula el tiempo restante y se procesa cualquier
  // vencimiento; el aviso de fondo queda programado directamente en el SO.
  useEffect(() => {
    if (!loaded) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const currentNow = Date.now();
      setNow(currentNow);
      const current = timerRef.current;
      if (current.state !== 'running') return;
      const evaluation = evaluateTimer(current, currentNow);
      if (evaluation.kind !== 'running') {
        console.log('[DIAG] Vencimiento detectado al volver al frente:', {
          kind: evaluation.kind,
        });
        completePhase(currentNow);
      }
    });
    return () => subscription.remove();
  }, [loaded, completePhase]);

  // Configuración del canal Android de alta importancia y del handler en
  // primer plano al montar (RF-01, RF-02, RF-08).
  useEffect(() => {
    configureNotificationHandler();
    void ensureAlarmChannel();
  }, []);

  useEffect(() => {
    if (!loaded || timer.state !== 'running' || timer.runningSinceMs === null) {
      return;
    }

    let active = true;
    let scheduledId: string | null = null;
    const nextCycle = advanceCycle(cycle, settings.pomodorosPerCycle);
    const content = getAlarmContent(cycle.phase, nextCycle.phase);
    const triggerAtMs = timer.runningSinceMs + timer.remainingMs;

    void ensureAlarmChannel()
      .then(() =>
        scheduleAlarmNotification({
          title: content.title,
          body: content.body,
          triggerAtMs,
        }),
      )
      .then((id) => {
        if (!id) return;
        if (!active) {
          void cancelScheduledAlarmNotification(id);
          return;
        }
        scheduledId = id;
        scheduledNotificationIdRef.current = id;
      });

    return () => {
      active = false;
      if (scheduledId && scheduledNotificationIdRef.current === scheduledId) {
        scheduledNotificationIdRef.current = null;
        void cancelScheduledAlarmNotification(scheduledId);
      }
    };
  }, [
    cycle,
    loaded,
    settings.pomodorosPerCycle,
    timer.remainingMs,
    timer.runningSinceMs,
    timer.state,
  ]);

  // Detiene el aviso y muestra la siguiente fase inmediatamente (RF-05;
  // Decisión 004). Sin límite de tiempo: suena hasta este momento (RF-04).
  const stopAlarm = useCallback(() => {
    void stopAlarmNotification(notificationIdRef.current);
    notificationIdRef.current = null;
    void cancelScheduledAlarmNotification(scheduledNotificationIdRef.current);
    scheduledNotificationIdRef.current = null;
    pendingPhaseRef.current = null;
    setAlarmActive(false);
    setAlarmContent(null);
    setNow(Date.now());
  }, []);

  // [DIAG TEMPORAL] Fuerza el vencimiento de la fase actual para comprobar el
  // aviso de inmediato, sin esperar la duración real. Se elimina al cerrar el
  // diagnóstico. No cambia config.ts ni las pruebas.
  const diagForceExpire = useCallback(() => {
    console.log('[DIAG] diagForceExpire(): forzando vencimiento.');
    void cancelScheduledAlarmNotification(scheduledNotificationIdRef.current);
    scheduledNotificationIdRef.current = null;
    const forcedTimer: Timer = {
      ...timerRef.current,
      state: 'running',
      runningSinceMs: Date.now() - timerRef.current.durationMs - 1000,
      remainingMs: 0,
    };
    setTimer(forcedTimer);
    completePhase(Date.now());
  }, [completePhase]);

  const start = useCallback(() => {
    // Flujo de permiso: la solicitud única la hace el primer arranque en
    // index.tsx (RF-02; Decisión 001 de la spec 006), por lo que aquí solo se
    // comprueba el estado, sin volver a preguntar. Si el permiso está
    // denegado, el inicio queda bloqueado hasta otorgarlo (RF-07; Decisión
    // 006 de la spec 004) y, si el sistema ya no muestra la solicitud, se
    // indica habilitarlo en los ajustes del sistema (Decisión 009). La
    // recuperación desde Ajustes es la opción «Activar avisos» (RF-04;
    // Decisión 008 de la spec 006).
    const run = async () => {
      const phase = cycleRef.current.phase;
      const status: NotificationPermissionStatus = await getPermissionStatus();

      console.log('[DIAG] start():', { phase, status });

      const permission = canStartTimerWithPermission(status);
      if (!permission.allowed) {
        const guidance = getPermissionRetryGuidance(
          status,
          await systemCanPrompt(),
        );
        console.warn('[DIAG] Inicio bloqueado por permiso:', {
          status,
          guidance: guidance.action,
        });
        setPermissionMessage(guidance.message);
        return;
      }

      console.log('[DIAG] Inicio permitido, arrancando temporizador.');
      setPermissionMessage(null);

      const currentNow = Date.now();
      const nextTimer = startTimer(timerRef.current, currentNow);
      setTimer(nextTimer);
      const nextRecord = applyTimerStart(
        recordRef.current,
        phase,
        currentNow,
      );
      setRecord(nextRecord);
      persistRecord(nextRecord);
      persistSession({ cycle: cycleRef.current, timer: nextTimer });
      setNow(currentNow);
    };

    void run();
  }, [persistRecord, persistSession]);

  const pause = useCallback(() => {
    const currentNow = Date.now();
    const nextTimer = pauseTimer(timerRef.current, currentNow);
    setTimer(nextTimer);
    persistSession({ cycle: cycleRef.current, timer: nextTimer });
    setNow(currentNow);
  }, [persistSession]);

  const resume = useCallback(() => {
    const currentNow = Date.now();
    const nextTimer = resumeTimer(timerRef.current, currentNow);
    setTimer(nextTimer);
    persistSession({ cycle: cycleRef.current, timer: nextTimer });
    setNow(currentNow);
  }, [persistSession]);

  // Reiniciar no toca el ciclo: contador intacto (RF-12); en descanso tampoco
  // modifica el resumen (RF-12, Decisión 007).
  const reset = useCallback(() => {
    const currentNow = Date.now();
    const previousState = timerRef.current.state;
    const nextTimer = resetTimer(timerRef.current);
    setTimer(nextTimer);
    const nextRecord = applyTimerReset(
      recordRef.current,
      cycleRef.current.phase,
      previousState,
      currentNow,
    );
    setRecord(nextRecord);
    persistRecord(nextRecord);
    persistSession({ cycle: cycleRef.current, timer: nextTimer });
    setNow(currentNow);
  }, [persistRecord, persistSession]);

  return {
    cycle,
    timer,
    remaining: remainingMs(timer, now),
    controls: controlsFor(timer.state),
    summary: deriveSummary(record),
    loaded,
    pomodorosPerCycle: settings.pomodorosPerCycle,
    alarmActive,
    alarmContent,
    permissionMessage,
    start,
    pause,
    resume,
    reset,
    stopAlarm,
    diagForceExpire,
  };
};
