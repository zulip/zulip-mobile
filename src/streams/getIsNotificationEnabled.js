/* @flow strict-local */
import type { Subscription } from '../types';

export default (
  subscription: Subscription | void,
  userSettingStreamNotification: boolean,
): boolean => subscription?.push_notifications ?? userSettingStreamNotification;
