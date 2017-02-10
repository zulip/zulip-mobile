import { getSubscriptions } from '../api';
import {
  INIT_SUBSCRIPTIONS,
} from '../constants';

export const fetchSubscriptions = (auth) =>
  async (dispatch) => {
    const response = await getSubscriptions(auth);
    dispatch({
      type: INIT_SUBSCRIPTIONS,
      subscriptions: response,
    });
  };
