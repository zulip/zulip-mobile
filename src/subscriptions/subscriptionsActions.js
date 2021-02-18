/* @flow strict-local */
import type { GetState, Dispatch } from '../types';
import { getAuth } from '../selectors';
import * as api from '../api';

export const toggleStreamNotification = (streamId: number, value: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
) => api.toggleStreamNotifications(getAuth(getState()), streamId, value);

export const togglePinStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await api.togglePinStream(getAuth(getState()), streamId, value);
};

export const toggleMuteStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await api.toggleMuteStream(getAuth(getState()), streamId, value);
};
