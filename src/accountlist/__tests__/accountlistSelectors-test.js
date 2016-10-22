import { fromJS } from 'immutable';
import { getAuth } from '../accountlistSelectors';

test('getAuth returns an empty object when no accounts', () => {
  const state = {
    accountlist: fromJS([]),
  };
  const auth = getAuth(state);
  expect(auth.toJS()).toEqual({
    realm: undefined,
    email: undefined,
    apiKey: undefined,
  });
});

test('getAuth returns only relevant fields', () => {
  const state = {
    accountlist: fromJS([{
      realm: 'https://realm1.com',
      otherField: 'someValue',
    }]),
  };
  const auth = getAuth(state);
  expect(auth.toJS()).toEqual({
    realm: 'https://realm1.com',
    email: undefined,
    apiKey: undefined,
  });
});

test('getAuth returns the auth information from the first account', () => {
  const state = {
    accountlist: fromJS([{
      realm: 'https://realm1.com',
    }, {
      realm: 'https://realm2.com',
    }]),
  };
  const auth = getAuth(state);
  expect(auth.toJS()).toEqual({
    realm: 'https://realm1.com',
    email: undefined,
    apiKey: undefined,
  });
});
