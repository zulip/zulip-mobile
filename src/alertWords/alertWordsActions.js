/* @flow */
import type { Auth, Dispatch } from '../types';
import { getAlertWords } from '../api';
import { INIT_ALERT_WORDS } from '../actionConstants';

export const initAlertWords = (alertWords: Object) => ({
  type: INIT_ALERT_WORDS,
  alertWords,
});

export const fetchAlertWords = (auth: Auth) => async (dispatch: Dispatch) =>
  dispatch(initAlertWords(await getAlertWords(auth)));
