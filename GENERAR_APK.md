# Generar un APK de Pomodoro_APP

## Requisitos previos

- Android SDK instalado (`~/Library/Android/sdk`) y Java 17 o superior.
- Dependencias instaladas: `npm install`.
- Variable de entorno del SDK:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

## Opción A: APK local con Gradle (sin cuenta de Expo)

La carpeta `android/` ya existe (generada con prebuild).

1. Si cambiaste `app.json`, plugins o dependencias nativas, regenera la carpeta nativa:

   ```bash
   npx expo prebuild --platform android --clean
   ```

2. Compila el APK de release (incluye el JavaScript empaquetado, no necesita Metro):

   ```bash
   cd android
   ./gradlew :app:assembleRelease
   ```

3. El APK queda en:

   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

4. Instálalo en el celular (depuración USB activada):

   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

Notas:

- Por defecto el release se firma con `debug.keystore`. Sirve para pruebas, no para Play Store.
- Para compilar más rápido, solo para tu celular: `./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a`.
- APK de debug (requiere Metro corriendo): `./gradlew :app:assembleDebug`, salida en `android/app/build/outputs/apk/debug/`.

## Opción B: APK en la nube con EAS Build

1. Instala y entra a EAS:

   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. En `eas.json`, define un perfil que genere APK:

   ```json
   {
     "build": {
       "preview": {
         "distribution": "internal",
         "android": { "buildType": "apk" }
       }
     }
   }
   ```

3. Lanza el build y descarga el APK desde el enlace que entrega:

   ```bash
   eas build --platform android --profile preview
   ```

## Problemas frecuentes

- `SDK location not found`: define `ANDROID_HOME` o crea `android/local.properties` con `sdk.dir=/Users/<usuario>/Library/Android/sdk`.
- Error por `scheme` en `app.json`: debe estar en minúsculas, sin guion bajo (por ejemplo `pomodoroapp`).
- Revisa la configuración con `npx expo-doctor`.
