/* @flow strict-local */
import type { Dispatch, GetState } from '../types';
import { getAlertWords } from '../api';
import { INIT_ALERT_WORDS } from '../actionConstants';
import { getAuth } from '../selectors';

export const initAlertWords = (alertWords: string[]) => ({
  type: INIT_ALERT_WORDS,
  alertWords,
});

export const fetchAlertWords = () => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const { alert_words } = await getAlertWords(auth);
  dispatch(initAlertWords(alert_words));
};
