/* @flow strict-local */
import type { GetState, Dispatch } from '../types';
import { getAuth } from '../selectors';
import toggleStreamNotifications from '../api/subscriptions/toggleStreamNotifications';

export const toggleStreamNotification = (streamId: number, value: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
) => toggleStreamNotifications(getAuth(getState()), streamId, value);
