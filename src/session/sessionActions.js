/* @flow strict-local */
import type { PerAccountAction, AccountIndependentAction, Orientation } from '../types';
import { APP_ONLINE, APP_ORIENTATION, DISMISS_SERVER_COMPAT_NOTICE } from '../actionConstants';

export const appOnline = (isOnline: boolean | null): AccountIndependentAction => ({
  type: APP_ONLINE,
  isOnline,
});

export const appOrientation = (orientation: Orientation): AccountIndependentAction => ({
  type: APP_ORIENTATION,
  orientation,
});

export const dismissCompatNotice = (): PerAccountAction => ({
  type: DISMISS_SERVER_COMPAT_NOTICE,
});
