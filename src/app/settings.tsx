import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  resetSettingsInput,
  validateSettingsForm,
  type PomodoroSettings,
  type SettingsField,
  type SettingsInput,
} from '@/domain/settings';
import { useSettings } from '@/hooks/use-settings';
import { getPermissionStatus } from '@/services/notifications';
import { Brand, Radii, Shadows, Spacing, ValidationError } from '@/constants/theme';
import { BrandButton } from '@/components/brand-button';
import { BrandDialog } from '@/components/brand-dialog';
import { Skeleton } from '@/components/skeleton';

const FIELDS: ReadonlyArray<{ field: SettingsField; label: string }> = [
  { field: 'studyMinutes', label: 'Estudio (min)' },
  { field: 'shortBreakMinutes', label: 'Descanso corto (min)' },
  { field: 'longBreakMinutes', label: 'Descanso largo (min)' },
  { field: 'pomodorosPerCycle', label: 'Pomodoros por ciclo' },
];

const NO_ERRORS: Record<SettingsField, string | null> = {
  studyMinutes: null,
  shortBreakMinutes: null,
  longBreakMinutes: null,
  pomodorosPerCycle: null,
};

const settingsToInput = (settings: PomodoroSettings): SettingsInput => ({
  studyMinutes: String(settings.studyMinutes),
  shortBreakMinutes: String(settings.shortBreakMinutes),
  longBreakMinutes: String(settings.longBreakMinutes),
  pomodorosPerCycle: String(settings.pomodorosPerCycle),
});

export default function SettingsScreen() {
  const { settings, saveSettings, loaded } = useSettings();
  const [input, setInput] = useState<SettingsInput>(() =>
    settingsToInput(settings),
  );
  const [errors, setErrors] = useState<Record<SettingsField, string | null>>(
    NO_ERRORS,
  );
  const [resetDialogVisible, setResetDialogVisible] = useState(false);

  // RF-04 (Decisión 009): null = aún desconocido; la opción «Activar avisos»
  // solo se muestra cuando el permiso de notificaciones NO está concedido
  // (rechazo, nunca concedido o revocado), nunca mientras se desconoce.
  const [alertsGranted, setAlertsGranted] = useState<boolean | null>(null);

  const refreshAlertsPermission = useCallback(async () => {
    const status = await getPermissionStatus();
    setAlertsGranted(status === 'granted');
  }, []);

  // RF-04 y RF-12 (Decisión 010): se consulta al entrar en la pantalla y al
  // volver a primer plano desde los ajustes del sistema, para que la opción
  // desaparezca en cuanto los avisos quedan concedidos.
  useFocusEffect(
    useCallback(() => {
      void refreshAlertsPermission();
    }, [refreshAlertsPermission]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshAlertsPermission();
    });
    return () => subscription.remove();
  }, [refreshAlertsPermission]);

  // RF-10 (DT-7): al entrar se rehidratan los campos desde el contexto; lo
  // escrito sin pulsar "Guardar" se descarta al salir y volver a entrar.
  useFocusEffect(
    useCallback(() => {
      setInput(settingsToInput(settings));
      setErrors(NO_ERRORS);
    }, [settings]),
  );

  const onFieldChange = useCallback((field: SettingsField, value: string) => {
    setInput((previous) => ({ ...previous, [field]: value }));
  }, []);

  const onSave = useCallback(() => {
    const result = validateSettingsForm(input);
    setErrors(result.errors);
    if (result.values === null) {
      // RF-05 (Decisión 004): guardado atómico; no se guarda ningún cambio.
      return;
    }
    void saveSettings(result.values);
  }, [input, saveSettings]);

  // RF-06 (Decisión 008): "Restablecer" solo rellena la pantalla; persiste
  // recién al pulsar "Guardar". La confirmación usa el diálogo propio
  // BrandDialog (patrón `mejorar-UI`) en lugar de Alert.alert, según la
  // autorización del usuario en sesión; textos y acciones son los mismos.
  const onResetPress = useCallback(() => {
    setResetDialogVisible(true);
  }, []);

  const onResetCancel = useCallback(() => {
    setResetDialogVisible(false);
  }, []);

  const onResetConfirm = useCallback(() => {
    setResetDialogVisible(false);
    setInput(resetSettingsInput());
    setErrors(NO_ERRORS);
  }, []);

  // RF-11 (Decisión 008 y 013): abre los ajustes del sistema para habilitar
  // el permiso de notificaciones. No se vuelve a solicitar el permiso desde
  // la aplicación: el estudiante lo gestiona en el sistema.
  const onActivateAlerts = useCallback(() => {
    void Linking.openSettings().catch((error) => {
      console.warn(
        '[DIAG] No se pudieron abrir los ajustes del sistema.',
        error,
      );
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cabecera: título (Bold) sobre azul marino + subtítulo breve. */}
          <View style={styles.header}>
            <Text
              style={styles.title}
              accessibilityRole="header"
              accessibilityLabel="Ajustes"
            >
              Ajustes
            </Text>
            <Text style={styles.subtitle}>Configura los tiempos de tu método Pomodoro</Text>
          </View>

          <View style={styles.card}>
            {FIELDS.map(({ field, label }) => {
              const error = errors[field];
              return (
                <View key={field} style={styles.fieldBlock}>
                  <Text style={styles.label} accessibilityRole="text">
                    {label}
                  </Text>
                  {loaded ? (
                    <TextInput
                      style={[styles.input, error !== null && styles.inputError]}
                      value={input[field]}
                      onChangeText={(value) => onFieldChange(field, value)}
                      keyboardType="number-pad"
                      accessibilityLabel={label}
                    />
                  ) : (
                    <Skeleton height={48} radius={Radii.input} />
                  )}
                  {error !== null ? (
                    <Text
                      style={styles.errorText}
                      accessibilityLabel={`${label}: ${error}`}
                    >
                      {error}
                    </Text>
                  ) : null}
                </View>
              );
            })}

            <View style={styles.buttonsRow}>
              <BrandButton
                label="Guardar"
                icon="save"
                onPress={onSave}
                disabled={!loaded}
              />
              <BrandButton
                label="Restablecer"
                icon="refresh"
                variant="gold"
                onPress={onResetPress}
                disabled={!loaded}
              />
            </View>

            {/* RF-04 y RF-12 (Decisión 009 y 012): solo cuando los avisos no
                están concedidos. Texto visible exacto «Activar avisos». */}
            {alertsGranted === false ? (
              <View style={styles.buttonsRow}>
                <BrandButton
                  label="Activar avisos"
                  icon="notifications"
                  variant="gold"
                  onPress={onActivateAlerts}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>

        <BrandDialog
          visible={resetDialogVisible}
          icon="bulb"
          title="¿Restablecer los tiempos?"
          message={'Los campos volverán a 25/5/15/4. Se guardarán solo si pulsas "Guardar".'}
          confirmLabel="Restablecer"
          onCancel={onResetCancel}
          onConfirm={onResetConfirm}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.navy,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  card: {
    backgroundColor: Brand.white,
    borderRadius: Radii.card,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    ...Shadows.card,
  },
  title: {
    color: Brand.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: Brand.white,
    opacity: 0.75,
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  fieldBlock: {
    gap: Spacing.two,
  },
  label: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
    borderWidth: 2,
    borderColor: Brand.navy,
    borderRadius: Radii.input,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 18,
    color: Brand.navy,
    backgroundColor: Brand.white,
  },
  inputError: {
    borderColor: ValidationError,
  },
  errorText: {
    color: ValidationError,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
