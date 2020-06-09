/* @flow strict-local */
import type { GetState, Dispatch } from '../types';
import { getAuth } from '../selectors';
import * as api from '../api';

export const toggleStreamNotification = (streamId: number, value: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
) => api.toggleStreamNotifications(getAuth(getState()), streamId, value);
