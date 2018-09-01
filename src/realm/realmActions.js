/* @flow strict-local */
import type {
  Auth,
  Dispatch,
  RealmFilter,
  InitialData,
  RealmEmojiState,
  RealmInitAction,
  InitRealmEmojiAction,
  InitRealmFilterAction,
} from '../types';
import { getRealmEmojis, getRealmFilters } from '../api';
import { REALM_INIT, INIT_REALM_EMOJI, INIT_REALM_FILTER } from '../actionConstants';

export const realmInit = (data: InitialData): RealmInitAction => ({
  type: REALM_INIT,
  data,
});

export const initRealmEmojis = (emojis: RealmEmojiState): InitRealmEmojiAction => ({
  type: INIT_REALM_EMOJI,
  emojis,
});

export const fetchRealmEmojis = (auth: Auth) => async (dispatch: Dispatch) =>
  dispatch(initRealmEmojis(await getRealmEmojis(auth)));

export const initRealmFilters = (filters: RealmFilter[]): InitRealmFilterAction => ({
  type: INIT_REALM_FILTER,
  filters,
});

export const fetchRealmFilters = (auth: Auth) => async (dispatch: Dispatch) => {
  const { filters } = await getRealmFilters(auth);
  dispatch(initRealmFilters(filters));
};
