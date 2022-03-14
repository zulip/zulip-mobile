/* @flow strict-local */
import type { PerAccountAction, AccountIndependentAction, Orientation } from '../types';
import {
  APP_ONLINE,
  APP_ORIENTATION,
  DEBUG_FLAG_TOGGLE,
  DISMISS_SERVER_COMPAT_NOTICE,
} from '../actionConstants';

export const appOnline = (isOnline: boolean | null): AccountIndependentAction => ({
  type: APP_ONLINE,
  isOnline,
});

export const appOrientation = (orientation: Orientation): AccountIndependentAction => ({
  type: APP_ORIENTATION,
  orientation,
});

export const debugFlagToggle = (key: string, value: boolean): AccountIndependentAction => ({
  type: DEBUG_FLAG_TOGGLE,
  key,
  value,
});

export const dismissCompatNotice = (): PerAccountAction => ({
  type: DISMISS_SERVER_COMPAT_NOTICE,
});
