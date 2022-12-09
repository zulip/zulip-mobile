/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { PerAccountAction, AllAccountsAction, GlobalThunkAction } from '../types';
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
import { resetAccountData } from './logoutActions';

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
  (index: number): GlobalThunkAction<Promise<void>> =>
  async (dispatch, getState, { activeAccountDispatch }) => {
    NavigationService.dispatch(resetToMainTabs());

    // Clear out the space we use for the active account's server data, to
    // make way for a new active account.
    // TODO(#5006): When each account has its own space to hold server data,
    //   we won't have to do this.
    activeAccountDispatch(resetAccountData());

    dispatch(accountSwitchPlain(index));

    // Now dispatch some actions on the new, post-switch active account.
    // Because we just dispatched `accountSwitchPlain`, that new account
    // is now the active account, so `activeAccountDispatch` will act on it.

    await activeAccountDispatch(registerAndStartPolling());

    // TODO(#3881): Lots of issues with outbox sending
    activeAccountDispatch(sendOutbox());

    activeAccountDispatch(initNotifications());
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
  (realm: URL, email: string, apiKey: string): GlobalThunkAction<Promise<void>> =>
  async (dispatch, getState, { activeAccountDispatch }) => {
    NavigationService.dispatch(resetToMainTabs());

    // In case there's already an active account, clear out the space we use
    // for the active account's server data, to make way for a new active
    // account.
    // TODO(#5006): When each account has its own space to hold server data,
    //   we won't have to do this.
    activeAccountDispatch(resetAccountData());

    dispatch(loginSuccessPlain(realm, email, apiKey));

    // Now dispatch some actions on the new, post-login active account.
    // Because we just dispatched `loginSuccessPlain`, that new account is
    // now the active account, so `activeAccountDispatch` will act on it.

    await activeAccountDispatch(registerAndStartPolling());

    // TODO(#3881): Lots of issues with outbox sending
    activeAccountDispatch(sendOutbox());

    activeAccountDispatch(initNotifications());
  };
