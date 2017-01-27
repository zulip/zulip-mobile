import { getAuth } from '../accountSelectors';

test('getAuth returns an empty object when no accounts', () => {
  const state = {
    account: [],
  };
  const auth = getAuth(state);
  expect(auth).toEqual({
    realm: undefined,
    email: undefined,
    apiKey: undefined,
  });
});

test('getAuth returns the auth information from the first account', () => {
  const state = {
    account: [
      { realm: 'https://realm1.com' },
      { realm: 'https://realm2.com' },
    ],
  };
  const auth = getAuth(state);
  expect(auth).toEqual({
    realm: 'https://realm1.com',
    email: undefined,
    apiKey: undefined,
  });
});
