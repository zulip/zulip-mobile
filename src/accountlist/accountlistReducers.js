import { fromJS } from 'immutable';

import {
  LOGIN_SUCCEEDED,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../account/accountActions';

// const initialState = fromJS([]);
const initialState = fromJS([{
  realm: 'http://zulip.tabbott.net',
  email: 'borisyankov@gmail.com',
  apiKey: '2tG3ZSmT5CQCBVa7AJeuIJG6q9GgNDz7',
}, {
  realm: 'http://hellorealm.com',
  email: 'bob@tester.com',
}]);

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCEEDED: {
      const accountIndex = state.findIndex(x =>
        x.get('realm') === action.realm && x.get('email') === action.email
      );

      if (accountIndex !== -1) {
        return state
          .unshift({
            realm: action.realm,
            apiKey: action.apiKey,
            email: action.email,
          })
          .delete(accountIndex + 1);
      }

      return state.unshift({
        realm: action.realm,
        apiKey: action.apiKey,
        email: action.email,
      });
    }
    case LOGOUT:
      return state
        .setIn([0, 'apiKey'], '');
    case ACCOUNT_REMOVE:
      return state
        .delete(action.index);
    default:
      return state;
  }
};
