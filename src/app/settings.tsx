import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
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

const BRAND_NAVY = '#181759';
const BRAND_GOLD = '#C69214';
const BRAND_WHITE = '#FFFFFF';
// Rojo reservado al mensaje de validación junto al campo (Decisión 005).
const ERROR_RED = '#C62828';

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
  const { settings, saveSettings } = useSettings();
  const [input, setInput] = useState<SettingsInput>(() =>
    settingsToInput(settings),
  );
  const [errors, setErrors] = useState<Record<SettingsField, string | null>>(
    NO_ERRORS,
  );

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
  // recién al pulsar "Guardar".
  const onResetPress = useCallback(() => {
    Alert.alert(
      '¿Restablecer los tiempos?',
      'Los campos volverán a 25/5/15/4. Se guardarán solo si pulsas "Guardar".',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            setInput(resetSettingsInput());
            setErrors(NO_ERRORS);
          },
        },
      ],
    );
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
          <View style={styles.card}>
            <Text
              style={styles.title}
              accessibilityRole="header"
              accessibilityLabel="Ajustes"
            >
              Ajustes
            </Text>

            {FIELDS.map(({ field, label }) => {
              const error = errors[field];
              return (
                <View key={field} style={styles.fieldBlock}>
                  <Text style={styles.label} accessibilityRole="text">
                    {label}
                  </Text>
                  <TextInput
                    style={[styles.input, error !== null && styles.inputError]}
                    value={input[field]}
                    onChangeText={(value) => onFieldChange(field, value)}
                    keyboardType="number-pad"
                    accessibilityLabel={label}
                  />
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
              <Pressable
                onPress={onSave}
                accessibilityRole="button"
                accessibilityLabel="Guardar"
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonNavy,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.buttonLabel}>Guardar</Text>
              </Pressable>
              <Pressable
                onPress={onResetPress}
                accessibilityRole="button"
                accessibilityLabel="Restablecer"
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonGold,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.buttonLabel}>Restablecer</Text>
              </Pressable>
            </View>

            {/* RF-04 y RF-12 (Decisión 009 y 012): solo cuando los avisos no
                están concedidos. Texto visible exacto «Activar avisos». */}
            {alertsGranted === false ? (
              <View style={styles.buttonsRow}>
                <Pressable
                  onPress={onActivateAlerts}
                  accessibilityRole="button"
                  accessibilityLabel="Activar avisos"
                  style={({ pressed }) => [
                    styles.button,
                    styles.buttonGold,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.buttonLabel}>Activar avisos</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_NAVY,
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
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: BRAND_WHITE,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    color: BRAND_NAVY,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  fieldBlock: {
    gap: 6,
  },
  label: {
    color: BRAND_NAVY,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
    borderWidth: 2,
    borderColor: BRAND_NAVY,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 18,
    color: BRAND_NAVY,
    backgroundColor: BRAND_WHITE,
  },
  inputError: {
    borderColor: ERROR_RED,
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonsRow: {
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
  buttonPressed: {
    opacity: 0.75,
  },
  buttonLabel: {
    color: BRAND_WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
});
