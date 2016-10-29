import { fromJS } from 'immutable';
import { getInitialRoutes } from '../routingSelectors';

test('if logged in, show main route', () => {
  const accountlist = fromJS([
    { apiKey: '123' },
  ]);
  const routes = getInitialRoutes(accountlist);
  expect(routes).toEqual(['main']);
});

test('if not logged in, and no previous accounts, show Realm entry', () => {
  const accountlist = fromJS([]);
  const routes = getInitialRoutes(accountlist);
  expect(routes).toEqual(['realm']);
});

test('if more than one account and no active account, display realm with account list in history', () => {
  const accountlist = fromJS([
    {},
    {},
  ]);
  const routes = getInitialRoutes(accountlist);
  expect(routes).toEqual(['accountlist', 'realm']);
});

test('when only a single account and no other properties, redirect to realm', () => {
  const accountlist = fromJS([
    { realm: 'https://example.com' },
  ]);
  const routes = getInitialRoutes(accountlist);
  expect(routes).toEqual(['realm']);
});

test('when multiple accounts and default one has realm and email, show password', () => {
  const accountlist = fromJS([
    { realm: 'https://example.com', email: 'johndoe@example.com' },
    { realm: 'https://example.com', email: 'janedoe@example.com' },
  ]);
  const routes = getInitialRoutes(accountlist);
  expect(routes).toEqual(['accountlist', 'realm', 'password']);
});

test('when default account has server and email set, redirect to enter password', () => {
  const accountlist = fromJS([
    { realm: 'https://example.com', email: 'johndoe@example.com' },
  ]);
  const routes = getInitialRoutes(accountlist);
  expect(routes).toEqual(['realm', 'password']);
});
