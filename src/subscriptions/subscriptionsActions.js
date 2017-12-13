/* @flow */
import type { GetState, Dispatch } from '../types';
import { getSubscriptions } from '../api';
import { INIT_SUBSCRIPTIONS } from '../actionConstants';
import { getAuth } from '../selectors';
import toggleStreamNotifications from '../api/subscriptions/toggleStreamNotifications';

export const initSubscriptions = (subscriptions: Object[]) => ({
  type: INIT_SUBSCRIPTIONS,
  subscriptions,
});

export const fetchSubscriptions = () => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initSubscriptions(await getSubscriptions(getAuth(getState()))));

export const toggleStreamNotification = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => toggleStreamNotifications(getAuth(getState()), streamId, value);
