import { getInitialRoutes } from '../routingSelectors';

test('if logged in, show main route', () => {
  const accounts = [
    { apiKey: '123' },
  ];
  const routes = getInitialRoutes(accounts);
  expect(routes).toEqual(['main']);
});

test('if not logged in, and no previous accounts, show realm screen', () => {
  const accounts = [];
  const routes = getInitialRoutes(accounts);
  expect(routes).toEqual(['realm']);
});

test('if more than one account and no active account, display account list', () => {
  const accounts = [
    {},
    {},
  ];
  const routes = getInitialRoutes(accounts);
  expect(routes).toEqual(['account']);
});

test('when only a single account and no other properties, redirect to realm', () => {
  const accounts = [
    { realm: 'https://example.com' },
  ];
  const routes = getInitialRoutes(accounts);
  expect(routes).toEqual(['realm']);
});

test('when multiple accounts and default one has realm and email, show account list', () => {
  const accounts = [
    { realm: 'https://example.com', email: 'johndoe@example.com' },
    { realm: 'https://example.com', email: 'janedoe@example.com' },
  ];
  const routes = getInitialRoutes(accounts);
  expect(routes).toEqual(['account']);
});

test('when default account has server and email set, redirect to realm screen', () => {
  const accounts = [
    { realm: 'https://example.com', email: 'johndoe@example.com' },
  ];
  const routes = getInitialRoutes(accounts);
  expect(routes).toEqual(['realm']);
});
