import { fromJS } from 'immutable';
import { getInitialRoutes } from '../routing';

it('if logged in', () => {
  const account = fromJS({ apiKey: '123' });
  const routes = getInitialRoutes(fromJS([account]), fromJS(account));
  expect(routes).toEqual(['main']);
});

it('if not logged in, and no previous accounts, show Realm entry', () => {
  const routes = getInitialRoutes(fromJS([]), undefined);
  expect(routes).toEqual(['realm']);
});

it('if more than one account and no active account, display realm with account list in history', () => {
  const routes = getInitialRoutes(fromJS([{}, {}]), undefined);
  expect(routes).toEqual(['accountlist', 'realm']);
});

it('when only a single account and no other properties, redirect to realm', () => {
  const account = fromJS({ realm: 'https://example.com' });
  const routes = getInitialRoutes(fromJS([account]), account);
  expect(routes).toEqual(['realm']);
});

it('when multiple accounts and default one has realm and email, show password', () => {
  const account = fromJS({ realm: 'https://example.com', email: 'johndoe@example.com' });
  const routes = getInitialRoutes(fromJS([account, {}]), account);
  expect(routes).toEqual(['accountlist', 'realm', 'password']);
});

it('when default account has server and email set, redirect to enter password', () => {
  const account = fromJS({
    realm: 'https://example.com',
    email: 'johndoe@example.com',
  });
  const routes = getInitialRoutes(fromJS([account]), account);
  expect(routes).toEqual(['realm', 'password']);
});
