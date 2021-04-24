/* @flow strict-local */

import { Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

/**
 * Haptic feedback will trigger if iOS >= 10 OR Device >= iPhone6s.
 *
 * In Android feedback trigger for all devices irrespective of system settings
 */
export const longPressHapticFeedback = () => {
  const hapticTriggerType = Platform.select({
    ios: 'selection',
    android: 'longPress',
  });
  ReactNativeHapticFeedback.trigger(hapticTriggerType, {
    ignoreAndroidSystemSettings: true,
  });
};
