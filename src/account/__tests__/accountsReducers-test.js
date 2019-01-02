import deepFreeze from 'deep-freeze';

import {
  REALM_ADD,
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../../actionConstants';
import accountsReducers from '../accountsReducers';

describe('accountsReducers', () => {
  describe('REALM_ADD', () => {
    test('if no account with this realm exists, insert new account in front', () => {
      const prevState = deepFreeze([{ realm: '1' }, { realm: '2' }]);

      const action = deepFreeze({
        type: REALM_ADD,
        realm: 'new',
      });

      const expectedState = [
        { realm: 'new', apiKey: '', email: '', ackedPushToken: null },
        { realm: '1' },
        { realm: '2' },
      ];

      const newState = accountsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });

    test('if account with this realm exists, move to front of list', () => {
      const prevState = deepFreeze([
        { realm: '1', someProp: 'someValue' },
        { realm: '2', otherProp: 'otherValue' },
      ]);

      const action = deepFreeze({
        type: REALM_ADD,
        realm: '2',
      });

      const expectedState = [
        { realm: '2', otherProp: 'otherValue' },
        { realm: '1', someProp: 'someValue' },
      ];

      const newState = accountsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('switching to first account does not change state', () => {
      const prevState = deepFreeze([
        {
          realm: 'http://realm.com',
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 0,
      });

      const newState = accountsReducers(prevState, action);

      expect(newState).toBe(prevState);
    });

    test('switching to an account moves the account to be first in the list', () => {
      const prevState = deepFreeze([
        { realm: 'http://realm1.com' },
        { realm: 'http://realm2.com' },
        { realm: 'http://realm3.com' },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 1,
      });

      const expectedState = [
        { realm: 'http://realm2.com' },
        { realm: 'http://realm1.com' },
        { realm: 'http://realm3.com' },
      ];

      const newState = accountsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('LOGIN_SUCCESS', () => {
    test('on login, update initial account with auth information', () => {
      const prevState = deepFreeze([
        {
          realm: 'http://realm.com',
        },
      ]);

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: '123',
        email: 'johndoe@example.com',
        realm: 'http://realm.com',
      });

      const expectedState = [
        {
          apiKey: '123',
          email: 'johndoe@example.com',
          realm: 'http://realm.com',
        },
      ];

      const newState = accountsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('on login, if account does not exist, add as first item', () => {
      const prevState = deepFreeze([
        {
          apiKey: '123',
          email: 'one@example.com',
          realm: 'http://realm1.com',
        },
      ]);

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: '456',
        email: 'two@example.com',
        realm: 'http://realm2.com',
      });

      const expectedState = [
        {
          apiKey: '456',
          email: 'two@example.com',
          realm: 'http://realm2.com',
          ackedPushToken: null,
        },
        {
          apiKey: '123',
          email: 'one@example.com',
          realm: 'http://realm1.com',
        },
      ];

      const newState = accountsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('on login, if account does exist, merge new data, move to top', () => {
      const prevState = deepFreeze([
        {
          apiKey: '123',
          realm: 'http://realm1.com',
          email: 'one@example.com',
        },
        {
          apiKey: '456',
          realm: 'http://realm2.com',
          email: 'two@example.com',
        },
      ]);

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: '789',
        realm: 'http://realm2.com',
        email: 'two@example.com',
      });

      const expectedState = [
        {
          apiKey: '789',
          realm: 'http://realm2.com',
          email: 'two@example.com',
        },
        {
          apiKey: '123',
          realm: 'http://realm1.com',
          email: 'one@example.com',
        },
      ];

      const newState = accountsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('LOGOUT', () => {
    test('on logout, remove apiKey from active account, keep other information intact', () => {
      const prevState = deepFreeze([
        {
          apiKey: '123',
          realm: 'http://realm1.com',
          email: 'one@example.com',
        },
        {
          apiKey: '456',
          realm: 'http://realm2.com',
          email: 'two@example.com',
        },
      ]);

      const action = deepFreeze({ type: LOGOUT });

      const expectedState = [
        {
          apiKey: '',
          realm: 'http://realm1.com',
          email: 'one@example.com',
        },
        {
          apiKey: '456',
          realm: 'http://realm2.com',
          email: 'two@example.com',
        },
      ];

      const newState = accountsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_REMOVE', () => {
    test('on account removal, delete item from list', () => {
      const prevState = deepFreeze([
        {
          apiKey: '123',
          realm: 'http://realm1.com',
          email: 'one@example.com',
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_REMOVE,
        index: 0,
      });

      const expectedState = [];

      const newState = accountsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
