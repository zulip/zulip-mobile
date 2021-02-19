/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import { ACCOUNT_SWITCH, LOGIN_SUCCESS, LOGOUT, ACCOUNT_REMOVE } from '../../actionConstants';
import accountsReducer from '../accountsReducer';
import { ZulipVersion } from '../../utils/zulipVersion';

import * as eg from '../../__tests__/lib/exampleData';

describe('accountsReducer', () => {
  describe('REALM_INIT', () => {
    const account1 = eg.makeAccount();
    const account2 = eg.makeAccount();
    const account3 = eg.makeAccount();

    test('records zulipVersion on active account', () => {
      const newZulipVersion = new ZulipVersion('2.0.0');
      expect(
        accountsReducer(
          deepFreeze([account1, account2, account3]),
          deepFreeze({ ...eg.action.realm_init, zulipVersion: newZulipVersion }),
        ),
      ).toEqual([{ ...account1, zulipVersion: newZulipVersion }, account2, account3]);
    });

    test('records zulipFeatureLevel on active account', () => {
      const newZulipFeatureLevel = 6;
      expect(
        accountsReducer(
          deepFreeze([account1, account2, account3]),
          deepFreeze({
            ...eg.action.realm_init,
            data: { ...eg.action.realm_init.data, zulip_feature_level: newZulipFeatureLevel },
          }),
        ),
      ).toEqual([{ ...account1, zulipFeatureLevel: newZulipFeatureLevel }, account2, account3]);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    const account1 = eg.makeAccount();
    const account2 = eg.makeAccount();
    const account3 = eg.makeAccount();

    test('switching to first account does not change state', () => {
      const prevState = deepFreeze([account1, account2, account3]);
      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 0,
      });

      const newState = accountsReducer(prevState, action);

      expect(newState).toBe(prevState);
    });

    test('switching to an account moves the account to be first in the list', () => {
      const prevState = deepFreeze([account1, account2, account3]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 1,
      });

      const expectedState = [account2, account1, account3];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('LOGIN_SUCCESS', () => {
    const account1 = eg.makeAccount({ email: '', realm: new URL('https://one.example.org') });
    const account2 = eg.makeAccount({ realm: new URL('https://two.example.org') });

    const prevState = deepFreeze([account1, account2]);

    test('on login, update initial account with auth information, without clobbering zulipVersion', () => {
      const newAccount = eg.makeAccount({
        realm: account1.realm,
        zulipVersion: null,
      });

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: newAccount.apiKey,
        email: newAccount.email,
        realm: newAccount.realm,
      });

      const expectedState = [{ ...newAccount, zulipVersion: account1.zulipVersion }, account2];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('on login, if account does not exist, add as first item', () => {
      const newAccount = eg.makeAccount({
        email: 'newaccount@example.com',
        realm: new URL('https://new.realm.org'),
        zulipVersion: null,
        zulipFeatureLevel: null,
      });

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: newAccount.apiKey,
        email: newAccount.email,
        realm: newAccount.realm,
      });

      const expectedState = [newAccount, account1, account2];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('on login, if account does exist, merge new data, move to top, without clobbering zulipVersion', () => {
      const newAccount = eg.makeAccount({
        email: account2.email,
        realm: account2.realm,
        zulipVersion: null,
      });
      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: newAccount.apiKey,
        realm: newAccount.realm,
        email: newAccount.email,
      });

      const expectedState = [{ ...newAccount, zulipVersion: account2.zulipVersion }, account1];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('LOGOUT', () => {
    test('on logout, clear just apiKey and ackedPushToken from active account', () => {
      const account1 = eg.makeAccount({ ackedPushToken: '123' });
      const account2 = eg.makeAccount();

      const prevState = deepFreeze([account1, account2]);

      const action = deepFreeze({ type: LOGOUT });

      const expectedState = [{ ...account1, apiKey: '', ackedPushToken: null }, account2];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_REMOVE', () => {
    test('on account removal, delete item from list', () => {
      const prevState = deepFreeze([eg.makeAccount()]);

      const action = deepFreeze({
        type: ACCOUNT_REMOVE,
        index: 0,
      });

      const expectedState = [];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
