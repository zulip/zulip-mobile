/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import {
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_REMOVE,
  EVENT,
} from '../../actionConstants';
import { randString } from '../../utils/misc';
import accountsReducer from '../accountsReducer';
import { ZulipVersion } from '../../utils/zulipVersion';

import * as eg from '../../__tests__/lib/exampleData';

describe('accountsReducer', () => {
  describe('REGISTER_COMPLETE', () => {
    const account1 = eg.selfAccount;
    const account2 = eg.makeAccount();
    const account3 = eg.makeAccount();

    test('records zulipVersion on active account', () => {
      const newZulipVersion = new ZulipVersion('2.0.0');
      expect(
        accountsReducer(
          deepFreeze([account1, account2, account3]),
          eg.mkActionRegisterComplete({ zulip_version: newZulipVersion }),
        ),
      ).toEqual([{ ...account1, zulipVersion: newZulipVersion }, account2, account3]);
    });

    test('records userId on active account', () => {
      const newUserId = eg.makeUser().user_id;
      expect(
        accountsReducer(
          deepFreeze([account1, account2, account3]),
          eg.mkActionRegisterComplete({ user_id: newUserId }),
        ),
      ).toEqual([{ ...account1, userId: newUserId }, account2, account3]);
    });

    test('records zulipFeatureLevel on active account', () => {
      const newZulipFeatureLevel = 6;
      expect(
        accountsReducer(
          deepFreeze([account1, account2, account3]),
          eg.mkActionRegisterComplete({
            zulip_feature_level: newZulipFeatureLevel,
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
      realm: new URL('https://one.example.org'),
      ackedPushToken: randString(),
    });
    const account2 = eg.makeAccount({
      realm: new URL('https://two.example.org'),
      ackedPushToken: randString(),
    });

    const prevState = deepFreeze([account1, account2]);

    test('on login, if account does not exist, add as first item, with null userId, zulipVersion, zulipFeatureLevel', () => {
      const newApiKey = randString();
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
          userId: null,
          zulipVersion: null,
          zulipFeatureLevel: null,
        }),
        account1,
        account2,
      ];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test("on login, if account does exist, move to top, update with apiKey, set ackedPushToken to null, don't clobber anything else", () => {
      const newApiKey = randString();

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

  describe('EventTypes.restart', () => {
    test('when server version/feature level are present, update active account', () => {
      const prevState = eg.plusReduxState.accounts;
      const [prevActiveAccount, ...prevRestOfAccounts] = prevState;
      expect(
        accountsReducer(prevState, {
          type: EVENT,
          event: {
            id: 1,
            type: 'restart',
            server_generation: 2,
            immediate: true,
            zulip_version: '4.0-dev-3932-g3df2dbfd0d',
            zulip_feature_level: 58,
          },
        }),
      ).toEqual([
        {
          ...prevActiveAccount,
          zulipVersion: new ZulipVersion('4.0-dev-3932-g3df2dbfd0d'),
          zulipFeatureLevel: 58,
        },
        ...prevRestOfAccounts,
      ]);
    });

    test("when server version/feature level are not present, don't update active account", () => {
      const prevState = eg.plusReduxState.accounts;
      expect(
        accountsReducer(prevState, {
          type: EVENT,
          event: {
            id: 1,
            type: 'restart',
            server_generation: 2,
            immediate: true,
          },
        }),
      ).toEqual(prevState);
    });
  });
});
