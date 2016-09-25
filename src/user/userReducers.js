import Immutable from 'immutable';

import {
  ACCOUNT_ADD_PENDING,
  ACCOUNT_ADD_SUCCEEDED,
  ACCOUNT_ADD_FAILED,

  LOGIN_PENDING,
  LOGIN_SUCCEEDED,
  LOGIN_FAILED,

  DEV_EMAILS_PENDING,
  DEV_EMAILS_SUCCEEDED,
  DEV_EMAILS_FAILED,
} from './userActions';

// Initial state
const UserRecord = Immutable.Record({
  accounts: new Immutable.OrderedMap(),
  activeAccountId: null,
  pendingServerResponse: false,
  errors: [],
});

const AccountRecord = Immutable.Record({
  accountId: null,
  realm: null,
  email: null,
  apiKey: null,
  authBackends: [],
  activeBackend: null,
  loggedIn: false,
});

const initialState = UserRecord();

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT_ADD_SUCCEEDED: {
      // Use time-based UUID for account ID
      const accountId = Date.now();

      return state.merge({
        accounts: state.accounts.set(accountId, {
          accountId,
          realm: action.realm,
          authBackends: new Immutable.List(action.authBackends),
          activeBackend: null,
          loggedIn: false,
        }),
        pendingServerResponse: false,
        activeAccountId: accountId,
      });
    }
    case ACCOUNT_ADD_FAILED:
      return state.merge({
        pendingServerResponse: false,
        errors: action.errors,
      });

    // Actions for the DevAuthBackend
    case DEV_EMAILS_PENDING:
      return state;
    case DEV_EMAILS_SUCCEEDED:
      return state.merge({
        accounts: state.accounts.set(action.account.accountId, {
          ...action.account,
          activeBackend: 'dev',
          directUsers: action.directUsers,
          directAdmins: action.directAdmins,
        }),
      });
    case DEV_EMAILS_FAILED:
      return state.merge({
        errors: action.errors,
      });
    case ACCOUNT_ADD_PENDING:
      return state.merge({
        pendingServerResponse: true,
      });
    case LOGIN_PENDING:
      return state.merge({
        pendingServerResponse: true,
      });
    case LOGIN_SUCCEEDED:
      return state.merge({
        pendingServerResponse: false,
        accounts: state.accounts.set(action.account.accountId, {
          ...action.account,
          activeBackend: action.activeBackend,
          email: action.email,
          apiKey: action.apiKey,
          loggedIn: true,
        }),
      });
    case LOGIN_FAILED:
      return state.merge({
        pendingServerResponse: false,
        accounts: state.accounts.set(action.account.accountId, {
          ...action.account,
          loggedIn: false,
        }),
      });
    default:
      return state;
  }
};

export default reducer;
