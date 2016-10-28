import { fromJS } from 'immutable';
import {
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../../constants';
import accountReducers from '../accountReducers';

test('on login, update initial account with auth information', () => {
  const prevState = fromJS([{
    realm: 'http://realm.com',
  }]);
  const newState = accountReducers(prevState, {
    type: LOGIN_SUCCESS,
    apiKey: '123',
    email: 'johndoe@example.com',
    realm: 'http://realm.com',
  });
  const expectedState = fromJS([{
    apiKey: '123',
    email: 'johndoe@example.com',
    realm: 'http://realm.com',
  }]);
  expect(newState.toJS()).toEqual(expectedState.toJS());
});

test('on login, if account does not exist, add as first item', () => {
  const prevState = fromJS([{
    apiKey: '123',
    email: 'one@example.com',
    realm: 'http://realm1.com',
  }]);
  const newState = accountReducers(prevState, {
    type: LOGIN_SUCCESS,
    apiKey: '456',
    email: 'two@example.com',
    realm: 'http://realm2.com',
  });
  const expectedState = fromJS([{
    apiKey: '456',
    email: 'two@example.com',
    realm: 'http://realm2.com',
  }, {
    apiKey: '123',
    email: 'one@example.com',
    realm: 'http://realm1.com',
  }]);
  expect(newState.toJS()).toEqual(expectedState.toJS());
});

test('on login, if account does exist, merge new data, move to top', () => {
  const prevState = fromJS([{
    apiKey: '123',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }, {
    apiKey: '456',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  }]);
  const newState = accountReducers(prevState, {
    type: LOGIN_SUCCESS,
    apiKey: '789',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  });
  const expectedState = fromJS([{
    apiKey: '789',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  }, {
    apiKey: '123',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }]);
  expect(newState.toJS()).toEqual(expectedState.toJS());
});

test('on logout, remove apiKey from active account, keep other information intact', () => {
  const prevState = fromJS([{
    apiKey: '123',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }, {
    apiKey: '456',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  }]);
  const newState = accountReducers(prevState, { type: LOGOUT });
  const expectedState = fromJS([{
    apiKey: '',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }, {
    apiKey: '456',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  }]);
  expect(newState.toJS()).toEqual(expectedState.toJS());
});

test('on account removal, delete item from list', () => {
  const prevState = fromJS([{
    apiKey: '123',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }]);
  const newState = accountReducers(prevState, { type: ACCOUNT_REMOVE, index: 0 });
  const expectedState = fromJS([]);
  expect(newState.toJS()).toEqual(expectedState.toJS());
});
