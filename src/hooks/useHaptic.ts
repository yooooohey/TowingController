import { useCallback } from 'react';

export function useHaptic() {
  const triggerHaptic = useCallback((pattern: number | number[] = 25) => {
    if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(pattern);
      } catch {
        // Ignore silently if blocked or unsupported
      }
    }
  }, []);

  const light = useCallback(() => triggerHaptic(15), [triggerHaptic]);
  const medium = useCallback(() => triggerHaptic(35), [triggerHaptic]);
  const strong = useCallback(() => triggerHaptic([50, 40, 50]), [triggerHaptic]);
  const dragStart = useCallback(() => triggerHaptic([40, 30, 40]), [triggerHaptic]);
  const success = useCallback(() => triggerHaptic([20, 30, 40]), [triggerHaptic]);

  return { triggerHaptic, light, medium, strong, dragStart, success };
}
