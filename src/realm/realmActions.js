/* @flow strict-local */
import type { Auth, Dispatch, RealmFilter, InitialData, RealmEmojiById, Action } from '../types';
import { getRealmEmojis, getRealmFilters } from '../api';
import { REALM_INIT, INIT_REALM_EMOJI, INIT_REALM_FILTER } from '../actionConstants';

export const realmInit = (data: InitialData): Action => ({
  type: REALM_INIT,
  data,
});

export const initRealmEmojis = (emojis: RealmEmojiById): Action => ({
  type: INIT_REALM_EMOJI,
  emojis,
});

export const fetchRealmEmojis = (auth: Auth) => async (dispatch: Dispatch) => {
  const { emoji } = await getRealmEmojis(auth);
  dispatch(initRealmEmojis(emoji));
};

export const initRealmFilters = (filters: RealmFilter[]): Action => ({
  type: INIT_REALM_FILTER,
  filters,
});

export const fetchRealmFilters = (auth: Auth) => async (dispatch: Dispatch) => {
  const { filters } = await getRealmFilters(auth);
  dispatch(initRealmFilters(filters));
};
