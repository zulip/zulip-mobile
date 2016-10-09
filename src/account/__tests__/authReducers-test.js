import { fromJS } from 'immutable';
import { ACCOUNT_ADD_SUCCEEDED, LOGIN_SUCCEEDED, LOGOUT } from '../../account/accountActions';
import authReducers, { getActiveAuth } from '../authReducers';

it.skip('on unrecognized action, returns input state unchanged', () => {
  const prevState = { hello: 'world' };
  const newState = authReducers(prevState, {});
  expect(newState).toEqual(prevState);
});

it.skip('todo', () => {
  const users = [{ full_name: 'user1' }, { full_name: 'user2' }];
  const newState = authReducers(fromJS([]), { type: ACCOUNT_ADD_SUCCEEDED, users });
  expect(newState).toEqual(users);
});

// ACCOUNT_ADD_SUCCEEDED
// LOGIN_SUCCEEDED
// LOGOUT
