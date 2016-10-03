import { fromJS } from 'immutable';
import { GET_USER_RESPONSE } from '../userListActions';
import userListReducers from '../userListReducers';

it('when unrecognized action, no previous state, returns initial state, does not throw', () => {
  const newState = userListReducers(undefined, {});
  expect(newState).toBeDefined();
});

it('on unrecognized action, returns input state unchanged', () => {
  const prevState = { hello: 'world' };
  const newState = userListReducers(prevState, {});
  expect(newState).toEqual(prevState);
});

it('on GET_USER_RESPONSE stores user data', () => {
  const users = [{ full_name: 'user1' }, { full_name: 'user2' }];
  const newState = userListReducers(fromJS([]), { type: GET_USER_RESPONSE, users });
  expect(newState).toEqual(users);
});
