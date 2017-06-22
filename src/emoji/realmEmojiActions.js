import { getRealmEmojis } from '../api';
import {
  INIT_REALM_EMOJI,
} from '../actionConstants';

export const initRealmEmojis = (emojis) => ({
  type: INIT_REALM_EMOJI,
  emojis,
});

export const fetchRealmEmojis = (auth) =>
  async (dispatch) =>
    dispatch(initRealmEmojis(await getRealmEmojis(auth)));
