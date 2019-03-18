/* @flow strict-local */
import type { Auth, Dispatch, RealmFilter, InitialData, Action } from '../types';
import { getRealmFilters } from '../api';
import { REALM_INIT, INIT_REALM_FILTER } from '../actionConstants';

export const realmInit = (data: InitialData): Action => ({
  type: REALM_INIT,
  data,
});

export const initRealmFilters = (filters: RealmFilter[]): Action => ({
  type: INIT_REALM_FILTER,
  filters,
});

export const fetchRealmFilters = (auth: Auth) => async (dispatch: Dispatch) => {
  const { filters } = await getRealmFilters(auth);
  dispatch(initRealmFilters(filters));
};
