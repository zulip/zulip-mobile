/* @flow strict-local */
import type { GetState, Dispatch, Subscription, Action } from '../types';
import { getSubscriptions } from '../api';
import { INIT_SUBSCRIPTIONS } from '../actionConstants';
import { getAuth } from '../selectors';
import toggleStreamNotifications from '../api/subscriptions/toggleStreamNotifications';

export const initSubscriptions = (subscriptions: Subscription[]): Action => ({
  type: INIT_SUBSCRIPTIONS,
  subscriptions,
});

export const fetchSubscriptions = () => async (dispatch: Dispatch, getState: GetState) => {
  const { subscriptions } = await getSubscriptions(getAuth(getState()));
  dispatch(initSubscriptions(subscriptions));
};

export const toggleStreamNotification = (streamId: number, value: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
) => toggleStreamNotifications(getAuth(getState()), streamId, value);
