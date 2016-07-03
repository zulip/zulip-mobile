import {
  ACCOUNT_ADD_SUCCEEDED,
  ACCOUNT_ADD_FAILED,

  LOGIN_ATTEMPTED,
  LOGIN_SUCCEEDED,
  LOGIN_FAILED,

  DEV_EMAILS_FETCHING,
  DEV_EMAILS_FETCHED,
  DEV_EMAILS_FAILED,
} from './userActions';

import Immutable from 'immutable';

// Initial state
const initialState = {
  accounts: new Immutable.OrderedMap(),
  activeAccountId: null,
  pendingLogin: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT_ADD_SUCCEEDED:
      // Use time-based UUID for account ID
      var accountId = Date.now();

      return {
        ...state,
        accounts: state.accounts.set(accountId, {
          accountId,
          realm: action.realm,
          authBackends: new Immutable.List(action.authBackends),
          activeBackend: null,
          loggedIn: false,
        }),
        activeAccountId: accountId,
      };

    // Actions for the DevAuthBackend
    case DEV_EMAILS_FETCHING:
      return state;
    case DEV_EMAILS_FETCHED:
      return {
        ...state,
        accounts: state.accounts.set(action.account.accountId, {
          ...action.account,
          activeBackend: 'dev',
          directUsers: action.directUsers,
          directAdmins: action.directAdmins,
        }),
      };
    case DEV_EMAILS_FAILED:
      return state;

    case LOGIN_ATTEMPTED:
      return {
        ...state,
        pendingLogin: true,
      };
    case LOGIN_SUCCEEDED:
      return {
        ...state,
        pendingLogin: false,
        accounts: state.accounts.set(action.account.accountId, {
          ...action.account,
          activeBackend: action.activeBackend,
          email: action.email,
          apiKey: action.apiKey,
          loggedIn: true,
        }),
      };
    case LOGIN_FAILED:
      return {
        ...state,
        pendingLogin: false,
        accounts: state.accounts.set(action.account.accountId, {
          ...action.account,
          activeBackend: action.activeBackend,
          loggedIn: false,
        }),
      };
    default:
      return state;
  }
};

export default reducer;
