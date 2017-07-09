/* @flow */
import type { GetState, Dispatch } from '../types';
import { getSubscriptions } from '../api';
import { INIT_SUBSCRIPTIONS } from '../actionConstants';
import { getAuth } from '../account/accountSelectors';

export const initSubscriptions = (subscriptions: Object[]) => ({
  type: INIT_SUBSCRIPTIONS,
  subscriptions,
});

export const fetchSubscriptions = () => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initSubscriptions(await getSubscriptions(getAuth(getState()))));
