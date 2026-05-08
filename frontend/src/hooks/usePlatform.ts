import { Capacitor } from '@capacitor/core';

export function usePlatform() {
  const isNative = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === 'android';
  const isIOS = Capacitor.getPlatform() === 'ios';
  const isWeb = Capacitor.getPlatform() === 'web';

  return { isNative, isAndroid, isIOS, isWeb };
}
