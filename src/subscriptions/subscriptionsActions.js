/* @flow strict-local */
import type { ThunkAction } from '../types';
import { getAuth } from '../selectors';
import type { SubscriptionProperty } from '../api/subscriptions/setSubscriptionProperty';
import * as api from '../api';

export const setSubscriptionProperty = (
  streamId: number,
  property: SubscriptionProperty,
  value: boolean,
): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  await api.setSubscriptionProperty(getAuth(getState()), streamId, property, value);
};
