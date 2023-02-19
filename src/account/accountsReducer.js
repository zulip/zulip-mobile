/* @flow strict-local */
import invariant from 'invariant';

import {
  EVENT,
  REGISTER_COMPLETE,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  ACK_PUSH_TOKEN,
  UNACK_PUSH_TOKEN,
  LOGOUT,
  DISMISS_SERVER_PUSH_SETUP_NOTICE,
  ACCOUNT_REMOVE,
} from '../actionConstants';
import { EventTypes } from '../api/eventTypes';
import type { AccountsState, Identity, Action, Account } from '../types';
import { NULL_ARRAY } from '../nullObjects';
import { ZulipVersion } from '../utils/zulipVersion';
import { identityOfAccount, keyOfIdentity } from './accountMisc';

const initialState = NULL_ARRAY;

const findAccount = (state: AccountsState, identity: Identity): number => {
  const { realm, email } = identity;
  return state.findIndex(
    account => account.realm.toString() === realm.toString() && account.email === email,
  );
};

function updateActiveAccount(state, change) {
  const activeAccount: Account | void = state[0];
  invariant(activeAccount, 'accounts reducer: expected active account');

  return [{ ...activeAccount, ...change }, ...state.slice(1)];
}

// eslint-disable-next-line default-param-last
export default (state: AccountsState = initialState, action: Action): AccountsState => {
  switch (action.type) {
    case REGISTER_COMPLETE:
      // TODO(#5009): Before implementing a multi-account schema (#5006),
      //   this will be the wrong account if the active account changed
      //   while the register was in progress. After #5006, this per-account
      //   action should naturally act on its own per-account state.
      return updateActiveAccount(state, {
        userId: action.data.user_id,
        zulipFeatureLevel: action.data.zulip_feature_level,
        zulipVersion: action.data.zulip_version,
        lastDismissedServerPushSetupNotice: action.data.realm_push_notifications_enabled
          ? null
          : state[0].lastDismissedServerPushSetupNotice,
      });

    case ACCOUNT_SWITCH: {
      const index = state.findIndex(
        a => keyOfIdentity(identityOfAccount(a)) === keyOfIdentity(action.identity),
      );
      const account: Account | void = state[index];
      invariant(account, 'accounts reducer (ACCOUNT_SWITCH): destination account not found');

      return index === 0
        ? state // no change; skip computation
        : [account, ...state.filter(a => a !== account)]; // put account first
    }

    case LOGIN_SUCCESS: {
      const { realm, email, apiKey } = action;
      const accountIndex = findAccount(state, { realm, email });
      if (accountIndex === -1) {
        return [
          {
            realm,
            email,
            apiKey,
            userId: null,
            ackedPushToken: null,
            zulipVersion: null,
            zulipFeatureLevel: null,
            lastDismissedServerPushSetupNotice: null,
          },
          ...state,
        ];
      }
      return [
        { ...state[accountIndex], apiKey, ackedPushToken: null },
        ...state.slice(0, accountIndex),
        ...state.slice(accountIndex + 1),
      ];
    }

    case ACK_PUSH_TOKEN: {
      const { pushToken: ackedPushToken, identity } = action;
      const accountIndex = findAccount(state, identity);
      if (accountIndex === -1) {
        return state;
      }
      return [
        ...state.slice(0, accountIndex),
        { ...state[accountIndex], ackedPushToken },
        ...state.slice(accountIndex + 1),
      ];
    }

    case UNACK_PUSH_TOKEN: {
      const { identity } = action;
      const accountIndex = findAccount(state, identity);
      if (accountIndex === -1) {
        return state;
      }
      return [
        ...state.slice(0, accountIndex),
        { ...state[accountIndex], ackedPushToken: null },
        ...state.slice(accountIndex + 1),
      ];
    }

    case LOGOUT: {
      // TODO: This will be the wrong account if the active account changed
      //   between pressing "logout" and confirming with the confirmation
      //   dialog. Fix, perhaps by having the LOGOUT action include an
      //   Identity in its payload.
      return updateActiveAccount(state, { apiKey: '', ackedPushToken: null });
    }

    case DISMISS_SERVER_PUSH_SETUP_NOTICE: {
      return updateActiveAccount(state, { lastDismissedServerPushSetupNotice: action.date });
    }

    case ACCOUNT_REMOVE: {
      const shouldRemove = a =>
        keyOfIdentity(identityOfAccount(a)) === keyOfIdentity(action.identity);

      invariant(state.some(shouldRemove), 'accounts reducer (ACCOUNT_REMOVE): account not found');

      return state.filter(a => !shouldRemove(a));
    }

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.restart: {
          const { zulip_feature_level, zulip_version } = event;
          if (zulip_feature_level === undefined || zulip_version === undefined) {
            return state;
          }

          // TODO: Detect if the feature level has changed, indicating an upgrade;
          //   if so, trigger a full refetch of server data.  See #4793.
          return updateActiveAccount(state, {
            zulipVersion: new ZulipVersion(zulip_version),
            zulipFeatureLevel: zulip_feature_level,
          });
        }
        default:
          return state;
      }
    }

    default:
      return state;
  }
};
