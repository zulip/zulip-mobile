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
    const account1 = eg.makeAccount({
      email: '',
      realm: new URL('https://one.example.org'),
      ackedPushToken: eg.randString(),
    });
    const account2 = eg.makeAccount({
      realm: new URL('https://two.example.org'),
      ackedPushToken: eg.randString(),
    });

    const prevState = deepFreeze([account1, account2]);

    test('on login, if account does not exist, add as first item, with null zulipVersion, zulipFeatureLevel', () => {
      const newApiKey = eg.randString();
      const newEmail = 'newaccount@example.com';
      const newRealm = new URL('https://new.realm.org');

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: newApiKey,
        email: newEmail,
        realm: newRealm,
      });

      const expectedState = [
        eg.makeAccount({
          realm: newRealm,
          email: newEmail,
          apiKey: newApiKey,
          zulipVersion: null,
          zulipFeatureLevel: null,
        }),
        account1,
        account2,
      ];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test("on login, if account does exist, move to top, update with auth information, set ackedPushToken to null, don't clobber anything else", () => {
      const newApiKey = eg.randString();

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: newApiKey,
        realm: account2.realm,
        email: account2.email,
      });

      const expectedState = [{ ...account2, apiKey: newApiKey, ackedPushToken: null }, account1];

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
