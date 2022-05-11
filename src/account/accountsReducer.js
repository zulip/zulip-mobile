/* @flow strict-local */
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
import type { AccountsState, Identity, Action } from '../types';
import { NULL_ARRAY } from '../nullObjects';
import { ZulipVersion } from '../utils/zulipVersion';

const initialState = NULL_ARRAY;

const registerComplete = (state, action) => [
  {
    ...state[0],
    userId: action.data.user_id,
    zulipFeatureLevel: action.data.zulip_feature_level ?? 0,
    zulipVersion: new ZulipVersion(action.data.zulip_version),
    lastDismissedServerPushSetupNotice: action.data.realm_push_notifications_enabled
      ? null
      : state[0].lastDismissedServerPushSetupNotice,
  },
  ...state.slice(1),
];

const accountSwitch = (state, action) => {
  if (action.index === 0) {
    return state;
  }

  return [state[action.index], ...state.slice(0, action.index), ...state.slice(action.index + 1)];
};

const findAccount = (state: AccountsState, identity: Identity): number => {
  const { realm, email } = identity;
  return state.findIndex(
    account => account.realm.toString() === realm.toString() && account.email === email,
  );
};

const loginSuccess = (state, action) => {
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
};

const ackPushToken = (state, action) => {
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
};

const unackPushToken = (state, action) => {
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
};

const accountRemove = (state, action) => {
  const newState = state.slice();
  newState.splice(action.index, 1);
  return newState;
};

// eslint-disable-next-line default-param-last
export default (state: AccountsState = initialState, action: Action): AccountsState => {
  switch (action.type) {
    case REGISTER_COMPLETE:
      return registerComplete(state, action);

    case ACCOUNT_SWITCH:
      return accountSwitch(state, action);

    case LOGIN_SUCCESS:
      return loginSuccess(state, action);

    case ACK_PUSH_TOKEN:
      return ackPushToken(state, action);

    case UNACK_PUSH_TOKEN:
      return unackPushToken(state, action);

    case LOGOUT: {
      return [{ ...state[0], apiKey: '', ackedPushToken: null }, ...state.slice(1)];
    }

    case DISMISS_SERVER_PUSH_SETUP_NOTICE: {
      return [{ ...state[0], lastDismissedServerPushSetupNotice: action.date }, ...state.slice(1)];
    }

    case ACCOUNT_REMOVE:
      return accountRemove(state, action);

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
          return [
            {
              ...state[0],
              zulipVersion: new ZulipVersion(zulip_version),
              zulipFeatureLevel: zulip_feature_level,
            },
            ...state.slice(1),
          ];
        }
        default:
          return state;
      }
    }

    default:
      return state;
  }
};
