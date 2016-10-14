import { fromJS } from 'immutable';

import {
  LOGIN_SUCCEEDED,
} from '../account/accountActions';

const initialState = fromJS([{
  realm: 'http://zulip.tabbott.net',
  email: 'borisyankov@gmail.com',
}, {
  realm: 'http://hellorealm.com',
  email: 'bob@tester.com',
}]);

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
