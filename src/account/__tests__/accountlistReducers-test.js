import {
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../../constants';
import accountReducers from '../accountReducers';

test('on login, update initial account with auth information', () => {
  const prevState = [{
    realm: 'http://realm.com',
  }];
  const newState = accountReducers(prevState, {
    type: LOGIN_SUCCESS,
    apiKey: '123',
    email: 'johndoe@example.com',
    realm: 'http://realm.com',
  });
  const expectedState = [{
    apiKey: '123',
    email: 'johndoe@example.com',
    realm: 'http://realm.com',
  }];
  expect(newState).toEqual(expectedState);
});

test('on login, if account does not exist, add as first item', () => {
  const prevState = [{
    apiKey: '123',
    email: 'one@example.com',
    realm: 'http://realm1.com',
  }];
  const newState = accountReducers(prevState, {
    type: LOGIN_SUCCESS,
    apiKey: '456',
    email: 'two@example.com',
    realm: 'http://realm2.com',
  });
  const expectedState = [{
    apiKey: '456',
    email: 'two@example.com',
    realm: 'http://realm2.com',
  }, {
    apiKey: '123',
    email: 'one@example.com',
    realm: 'http://realm1.com',
  }];
  expect(newState).toEqual(expectedState);
});

test('on login, if account does exist, merge new data, move to top', () => {
  const prevState = [{
    apiKey: '123',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }, {
    apiKey: '456',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  }];
  const newState = accountReducers(prevState, {
    type: LOGIN_SUCCESS,
    apiKey: '789',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  });
  const expectedState = [{
    apiKey: '789',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  }, {
    apiKey: '123',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }];
  expect(newState).toEqual(expectedState);
});

test('on logout, remove apiKey from active account, keep other information intact', () => {
  const prevState = [{
    apiKey: '123',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }, {
    apiKey: '456',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  }];
  const newState = accountReducers(prevState, { type: LOGOUT });
  const expectedState = [{
    apiKey: '',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }, {
    apiKey: '456',
    realm: 'http://realm2.com',
    email: 'two@example.com',
  }];
  expect(newState).toEqual(expectedState);
});

test('on account removal, delete item from list', () => {
  const prevState = [{
    apiKey: '123',
    realm: 'http://realm1.com',
    email: 'one@example.com',
  }];
  const newState = accountReducers(prevState, { type: ACCOUNT_REMOVE, index: 0 });
  const expectedState = [];
  expect(newState).toEqual(expectedState);
});
