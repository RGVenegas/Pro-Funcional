import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const initCapacitorBridge = (onBackPress?: () => boolean): void => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // 1. Configurar Barra de Estado Nativa
  try {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#010A01' });
    StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn('[Capacitor] StatusBar config warning:', err);
  }

  // 2. Ocultar Splash Screen una vez montada la app
  try {
    SplashScreen.hide();
  } catch (err) {
    console.warn('[Capacitor] SplashScreen hide warning:', err);
  }

  // 3. Manejo de botón físico Atrás en Android
  try {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (onBackPress && onBackPress()) {
        return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch (err) {
    console.warn('[Capacitor] App backButton warning:', err);
  }
};
