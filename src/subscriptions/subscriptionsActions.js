/* @flow strict-local */
import type { GetState, Dispatch, Subscription, InitSubscriptionsAction } from '../types';
import { getSubscriptions } from '../api';
import { INIT_SUBSCRIPTIONS } from '../actionConstants';
import { getAuth } from '../selectors';
import toggleStreamNotifications from '../api/subscriptions/toggleStreamNotifications';

export const initSubscriptions = (subscriptions: Subscription[]): InitSubscriptionsAction => ({
  type: INIT_SUBSCRIPTIONS,
  subscriptions,
});

export const fetchSubscriptions = () => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initSubscriptions(await getSubscriptions(getAuth(getState()))));

export const toggleStreamNotification = (streamId: number, value: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
) => toggleStreamNotifications(getAuth(getState()), streamId, value);
