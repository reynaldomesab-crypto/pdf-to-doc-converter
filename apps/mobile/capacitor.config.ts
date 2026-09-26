import { defineConfig } from '@capacitor/cli';

export default defineConfig({
  appId: 'com.pdfocconverter.app',
  appName: 'PDF to DOC Converter',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2563eb',
      showSpinner: false,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keyPassword: undefined,
    },
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
});