import { getSubscriptions } from '../api';
import {
  INIT_SUBSCRIPTIONS,
} from '../actionConstants';

export const initSubscriptions = (subscriptions) => ({
  type: INIT_SUBSCRIPTIONS,
  subscriptions,
});

export const fetchSubscriptions = (auth) =>
  async (dispatch) =>
    dispatch(initSubscriptions(await getSubscriptions(auth)));
