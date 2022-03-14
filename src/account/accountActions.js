/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { PerAccountAction, AllAccountsAction, ThunkAction, GlobalThunkAction } from '../types';
import {
  ACCOUNT_SWITCH,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  DISMISS_SERVER_PUSH_SETUP_NOTICE,
} from '../actionConstants';
import { registerAndStartPolling } from '../events/eventActions';
import { resetToMainTabs } from '../nav/navActions';
import { sendOutbox } from '../outbox/outboxActions';
import { initNotifications } from '../notification/notifTokens';

export const dismissServerPushSetupNotice = (): PerAccountAction => ({
  type: DISMISS_SERVER_PUSH_SETUP_NOTICE,

  // We don't compute this in a reducer function. Those should be pure
  // functions of their params:
  //   https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers#rules-of-reducers
  date: new Date(),
});

const accountSwitchPlain = (index: number): AllAccountsAction => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const accountSwitch =
  (index: number): GlobalThunkAction<void> =>
  (dispatch, getState) => {
    NavigationService.dispatch(resetToMainTabs());
    dispatch(accountSwitchPlain(index));
  };

export const removeAccount = (index: number): AllAccountsAction => ({
  type: ACCOUNT_REMOVE,
  index,
});

const loginSuccessPlain = (realm: URL, email: string, apiKey: string): AllAccountsAction => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
});

export const loginSuccess =
  (realm: URL, email: string, apiKey: string): ThunkAction<Promise<void>> =>
  async (dispatch, getState) => {
    NavigationService.dispatch(resetToMainTabs());
    dispatch(loginSuccessPlain(realm, email, apiKey));

    await dispatch(registerAndStartPolling());

    // TODO(#3881): Lots of issues with outbox sending
    dispatch(sendOutbox());

    dispatch(initNotifications());
  };
