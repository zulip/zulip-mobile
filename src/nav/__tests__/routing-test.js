import { fromJS } from 'immutable';
import { getNextLoginRoute } from '../routing';

it('when no accounts, show Pick Server', () => {
  const nextRoute = getNextLoginRoute(fromJS([]), undefined);
  expect(nextRoute).toEqual('realm');
});

it('if more than one account and no active account, display account list screen', () => {
  const nextRoute = getNextLoginRoute(fromJS([{}, {}]), undefined);
  expect(nextRoute).toEqual('accountlist');
});

it('when account has only a server property, redirect to enter password', () => {
  const account = fromJS({ realm: 'https://example.com' });
  const nextRoute = getNextLoginRoute(fromJS([account]), account);
  expect(nextRoute).toEqual('password');
});

it('when account has server and email set, redirect to enter password', () => {
  const account = fromJS({
    realm: 'https://example.com',
    email: 'johndoe@example.com',
  });
  const nextRoute = getNextLoginRoute(fromJS([account]), account);
  expect(nextRoute).toEqual('password');
});
