/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type {
  Dispatch,
  PerAccountAction,
  AllAccountsAction,
  ThunkAction,
  GlobalThunkAction,
} from '../types';
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
  (index: number): GlobalThunkAction<Promise<void>> =>
  async (dispatch, getState) => {
    NavigationService.dispatch(resetToMainTabs());
    dispatch(accountSwitchPlain(index));

    /* $FlowFixMe[incompatible-type]

     This is really a GlobalDispatch, because we're in a GlobalThunkAction.
     (It's global because it needs to know about all the accounts to set the
     pointer to the active one). But here, we pretend it's a Dispatch.
     That's OK, for now, because:

     - Our Dispatch function is secretly the same value as our
       GlobalDispatch.
     - The PerAccountState that Dispatch currently acts on is the one
       belonging to the active account.
     - We want this dispatch to act on the active account -- the new,
       post-switch active account.
     - It will act on that account, because at this point we've already
       dispatched `accountSwitchPlain`.

     TODO(#5006): perhaps have an `activeAccountDispatch: Dispatch` in
       a new GlobalThunkExtras, modeled on ThunkExtras?
  */
    const activeAccountDispatch: Dispatch = dispatch;

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
  (realm: URL, email: string, apiKey: string): ThunkAction<Promise<void>> =>
  async (dispatch, getState) => {
    NavigationService.dispatch(resetToMainTabs());
    dispatch(loginSuccessPlain(realm, email, apiKey));

    await dispatch(registerAndStartPolling());

    // TODO(#3881): Lots of issues with outbox sending
    dispatch(sendOutbox());

    dispatch(initNotifications());
  };
