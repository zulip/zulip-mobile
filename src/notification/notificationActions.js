/* @flow strict-local */

import type { GlobalThunkAction } from '../types';
import { getNarrowFromNotificationData, getAccountFromNotificationData } from '.';
import type { Notification } from './types';
import { getStreamsByName } from '../selectors';
import { getAccounts } from '../directSelectors';
import { getAllUsersByEmail, getOwnUserId } from '../users/userSelectors';
import { doNarrow } from '../message/messagesActions';
import { accountSwitch } from '../account/accountActions';
import { tryGetActiveAccountState } from '../account/accountsSelectors';

export const narrowToNotification = (data: ?Notification): GlobalThunkAction<void> => (
  dispatch,
  getState,
) => {
  if (!data) {
    return;
  }

  const globalState = getState();
  const accountIndex = getAccountFromNotificationData(data, getAccounts(globalState));
  if (accountIndex !== null && accountIndex > 0) {
    // Notification is for a non-active account.  Switch there.
    dispatch(accountSwitch(accountIndex));
    // TODO actually narrow to conversation.
    return;
  }

  // If accountIndex is null, then `getAccountFromNotificationData` has
  // already logged a warning.  We go on to treat it as if it's 0, i.e. the
  // active account, in the hopes that the user has one account they use
  // regularly and it's the same one this notification is for.

  const state = tryGetActiveAccountState(globalState);
  if (!state) {
    // There are no accounts at all.  (Which also means accountIndex is null
    // and we've already logged a warning.)
    return;
  }

  const narrow = getNarrowFromNotificationData(
    data,
    getAllUsersByEmail(state),
    getStreamsByName(state),
    getOwnUserId(state),
  );
  if (narrow) {
    // We have a GlobalDispatch, because this is a global thunk action --
    // at the top of the function, we didn't yet know which account was
    // intended and had to work that out.  But now we know we're working on
    // the active account, and want to dispatch a per-account action there.
    // For the present, we just use the fact that our GlobalDispatch value
    // is the same function as we use for Dispatch.
    // TODO(#5006): perhaps have an extra `activeAccountDispatch: Dispatch`?
    (dispatch: $FlowFixMe)(doNarrow(narrow));
  }
};
