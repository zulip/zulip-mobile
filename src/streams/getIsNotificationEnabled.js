/* @flow strict-local */
import type { Subscription } from '../types';

/**
 * Whether push notifications are enabled for this stream.
 *
 * The `userSettingsStreamNotification` parameter should correspond to
 * `state.settings.streamNotification`.
 */
export default (
  subscription: Subscription | void,
  userSettingStreamNotification: boolean,
): boolean => subscription?.push_notifications ?? userSettingStreamNotification;
