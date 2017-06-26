/* @flow */
import type { Auth, Dispatch } from '../types';
import { getSubscriptions } from '../api';
import {
  INIT_SUBSCRIPTIONS,
} from '../actionConstants';

export const initSubscriptions = (subscriptions: Object[]) => ({
  type: INIT_SUBSCRIPTIONS,
  subscriptions,
});

export const fetchSubscriptions = (auth: Auth) =>
  async (dispatch: Dispatch) =>
    dispatch(initSubscriptions(await getSubscriptions(auth)));
