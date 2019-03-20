/* @flow strict-local */
import differenceInSeconds from 'date-fns/difference_in_seconds';

import type { Dispatch, GetState, Narrow, Action, User } from '../types';
/* eslint-disable import/no-named-as-default-member */
import api, { updateUserProfile } from '../api';
import { PRESENCE_RESPONSE, EVENT_USER_UPDATE } from '../actionConstants';
import { getAuth, tryGetAuth } from '../selectors';
import { isPrivateOrGroupNarrow } from '../utils/narrow';

let lastReportPresence = new Date();
let lastTypingStart = new Date();

export const reportPresence = (hasFocus: boolean = true, newUserInput: boolean = false) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = tryGetAuth(getState());
  if (!auth) {
    return; // not logged in
  }

  if (differenceInSeconds(new Date(), lastReportPresence) < 60) {
    return;
  }

  lastReportPresence = new Date();

  const response = await api.reportPresence(auth, hasFocus, newUserInput);
  dispatch({
    type: PRESENCE_RESPONSE,
    presence: response.presences,
    serverTimestamp: response.server_timestamp,
  });
};

export const sendTypingEvent = (narrow: Narrow) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (!isPrivateOrGroupNarrow(narrow)) {
    return;
  }

  if (differenceInSeconds(new Date(), lastTypingStart) > 15) {
    const auth = getAuth(getState());
    api.typing(auth, narrow[0].operand, 'start');
    lastTypingStart = new Date();
  }
};

export const updateAccount = (
  email: string,
  newAccountDetails: {| full_name: string |},
): Action => ({
  type: EVENT_USER_UPDATE,
  email,
  newAccountDetails,
});

export const doUpdateUserProfile = (
  initialValues: User,
  newValues: {| full_name: string |},
) => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  await updateUserProfile(auth, newValues);
  dispatch(updateAccount(initialValues.email, newValues));
};
