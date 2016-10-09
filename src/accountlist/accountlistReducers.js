import { fromJS } from 'immutable';

import {
  LOGIN_SUCCEEDED,
} from '../account/accountActions';

const initialState = fromJS([]);

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCEEDED: {
      const account = state.find(x =>
        x.get('realm') === action.realm && x.get('email') === action.email);
      if (account) {
        // move to top
      } else {
        state.push({
          realm: action.realm,
          apiKey: action.apiKey,
          email: action.email,
        });
      }
      return state;
    }
    default:
      return state;
  }
};

export const getActiveAccount = (state) =>
  state.accountlist.get(0) || {};

export const getAuth = (state) => {
  const account = getActiveAccount(state);
  return {
    email: account.email,
    apiKey: account.apiKey,
    realm: account.realm,
  };
};
