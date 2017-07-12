/* @flow */
import type { Auth, Dispatch } from '../types';
import { getRealmEmojis } from '../api';
import { INIT_REALM_EMOJI } from '../actionConstants';

export const initRealmEmojis = (emojis: Object) => ({
  type: INIT_REALM_EMOJI,
  emojis,
});

export const fetchRealmEmojis = (auth: Auth) => async (dispatch: Dispatch) =>
  dispatch(initRealmEmojis(await getRealmEmojis(auth)));
