import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export function useHaptics() {
  const impact = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (!isNative) return;
    await Haptics.impact({ style });
  };

  const tap = () => impact(ImpactStyle.Light);
  const medium = () => impact(ImpactStyle.Medium);
  const heavy = () => impact(ImpactStyle.Heavy);

  const success = async () => {
    if (!isNative) return;
    await Haptics.notification({ type: NotificationType.Success });
  };

  const error = async () => {
    if (!isNative) return;
    await Haptics.notification({ type: NotificationType.Error });
  };

  const warning = async () => {
    if (!isNative) return;
    await Haptics.notification({ type: NotificationType.Warning });
  };

  return { tap, medium, heavy, success, error, warning, impact };
}
