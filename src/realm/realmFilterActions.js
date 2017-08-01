/* @flow */
import type { Auth, Dispatch } from '../types';
import { getRealmFilters } from '../api';
import { INIT_REALM_FILTER } from '../actionConstants';

export const initRealmFilters = (filters: Object) => ({
  type: INIT_REALM_FILTER,
  filters,
});

export const fetchRealmFilters = (auth: Auth) => async (dispatch: Dispatch) =>
  dispatch(initRealmFilters(await getRealmFilters(auth)));
