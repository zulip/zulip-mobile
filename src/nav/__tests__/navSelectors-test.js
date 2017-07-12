import { getInitialRoute } from '../navSelectors';

test('if logged in, show main route', () => {
  const state = {
    accounts: [{ apiKey: '123' }],
  };

  const route = getInitialRoute(state);

  expect(route).toEqual('main');
});

test('if not logged in, and no previous accounts, show realm screen', () => {
  const state = {
    accounts: [],
  };

  const route = getInitialRoute(state);

  expect(route).toEqual('realm');
});

test('if more than one account and no active account, display account list', () => {
  const state = {
    accounts: [{}, {}],
  };

  const route = getInitialRoute(state);

  expect(route).toEqual('account');
});

test('when only a single account and no other properties, redirect to realm', () => {
  const state = {
    accounts: [{ realm: 'https://example.com' }],
  };

  const route = getInitialRoute(state);

  expect(route).toEqual('realm');
});

test('when multiple accounts and default one has realm and email, show account list', () => {
  const state = {
    accounts: [
      { realm: 'https://example.com', email: 'johndoe@example.com' },
      { realm: 'https://example.com', email: 'janedoe@example.com' },
    ],
  };

  const route = getInitialRoute(state);

  expect(route).toEqual('account');
});

test('when default account has server and email set, redirect to realm screen', () => {
  const state = {
    accounts: [{ realm: 'https://example.com', email: 'johndoe@example.com' }],
  };

  const route = getInitialRoute(state);

  expect(route).toEqual('realm');
});
