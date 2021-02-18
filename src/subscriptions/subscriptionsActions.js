/* @flow strict-local */
import type { GetState, Dispatch } from '../types';
import { getAuth } from '../selectors';
import * as api from '../api';

export const toggleStreamNotification = (streamId: number, value: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
) => api.setSubscriptionProperty(getAuth(getState()), streamId, 'push_notifications', value);

export const togglePinStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await api.setSubscriptionProperty(getAuth(getState()), streamId, 'pin_to_top', value);
};

export const toggleMuteStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await api.setSubscriptionProperty(getAuth(getState()), streamId, 'is_muted', value);
};
