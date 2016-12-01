import {
  REALM_ADD,
  SET_AUTH_TYPE,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../../constants';
import accountReducers from '../accountReducers';

describe('accountReducers', () => {
  describe('REALM_ADD', () => {
    test('if no account with this realm exists, insert new account infront', () => {
      const prevState = [
        { realm: '1' },
        { realm: '2' },
      ];
      const action = {
        type: REALM_ADD,
        realm: 'new',
      };
      const expectedState = [
        { realm: 'new' },
        { realm: '1' },
        { realm: '2' },
      ];

      const newState = accountReducers(prevState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });

    test('if account with this realm exists, move to front of list', () => {
      const prevState = [
        { realm: '1', someProp: 'someValue' },
        { realm: '2', otherProp: 'otherValue' },
      ];
      const action = {
        type: REALM_ADD,
        realm: '2',
      };
      const expectedState = [
        { realm: '2', otherProp: 'otherValue' },
        { realm: '1', someProp: 'someValue' },
      ];

      const newState = accountReducers(prevState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });
  });

  describe('SET_AUTH_TYPE', () => {
    test('changes authType of first account in list, produces new object', () => {
      const prevState = [{
        authType: '',
      }];
      const action = { type: SET_AUTH_TYPE, authType: 'password' };
      const expectedState = [{
        authType: 'password',
      }];

      const newState = accountReducers(prevState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });
  });

  describe('LOGIN_SUCCESS', () => {
    test('on login, update initial account with auth information', () => {
      const prevState = [{
        realm: 'http://realm.com',
      }];
      const action = {
        type: LOGIN_SUCCESS,
        apiKey: '123',
        email: 'johndoe@example.com',
        realm: 'http://realm.com',
      };
      const expectedState = [{
        apiKey: '123',
        email: 'johndoe@example.com',
        realm: 'http://realm.com',
      }];

      const newState = accountReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('on login, if account does not exist, add as first item', () => {
      const prevState = [{
        apiKey: '123',
        email: 'one@example.com',
        realm: 'http://realm1.com',
      }];
      const action = {
        type: LOGIN_SUCCESS,
        apiKey: '456',
        email: 'two@example.com',
        realm: 'http://realm2.com',
      };
      const expectedState = [{
        apiKey: '456',
        email: 'two@example.com',
        realm: 'http://realm2.com',
      }, {
        apiKey: '123',
        email: 'one@example.com',
        realm: 'http://realm1.com',
      }];

      const newState = accountReducers(prevState, action);

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
      const action = {
        type: LOGIN_SUCCESS,
        apiKey: '789',
        realm: 'http://realm2.com',
        email: 'two@example.com',
      };
      const expectedState = [{
        apiKey: '789',
        realm: 'http://realm2.com',
        email: 'two@example.com',
      }, {
        apiKey: '123',
        realm: 'http://realm1.com',
        email: 'one@example.com',
      }];

      const newState = accountReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('LOGOUT', () => {
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
      const action = { type: LOGOUT };
      const expectedState = [{
        apiKey: '',
        realm: 'http://realm1.com',
        email: 'one@example.com',
      }, {
        apiKey: '456',
        realm: 'http://realm2.com',
        email: 'two@example.com',
      }];

      const newState = accountReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_REMOVE', () => {
    test('on account removal, delete item from list', () => {
      const prevState = [{
        apiKey: '123',
        realm: 'http://realm1.com',
        email: 'one@example.com',
      }];
      const action = {
        type: ACCOUNT_REMOVE,
        index: 0,
      };
      const expectedState = [];

      const newState = accountReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
