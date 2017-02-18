import { getSubscriptions } from '../api';
import {
  INIT_SUBSCRIPTIONS,
} from '../constants';

export const initSubscriptions = (subscriptions) => ({
  type: INIT_SUBSCRIPTIONS,
  subscriptions,
});

export const fetchSubscriptions = (auth) =>
  async (dispatch) =>
    dispatch(initSubscriptions(await getSubscriptions(auth)));
