import deepFreeze from 'deep-freeze';

import { getInitialNavState } from '../navSelectors';

describe('getInitialNavState', () => {
  test('if logged in, preserve the state', () => {
    const state = deepFreeze({
      accounts: [{ apiKey: '123' }],
      nav: {
        routes: [{ routeName: 'route1' }, { routeName: 'route2' }],
      },
    });

    const nav = getInitialNavState(state);

    expect(nav.routes.length).toEqual(2);
    expect(nav.routes[0].routeName).toEqual('route1');
    expect(nav.routes[1].routeName).toEqual('route2');
  });

  test('if not logged in, and no previous accounts, show realm screen', () => {
    const state = deepFreeze({
      accounts: [],
      nav: {
        routes: [],
      },
    });

    const nav = getInitialNavState(state);

    expect(nav.routes.length).toBe(1);
    expect(nav.routes[0].routeName).toEqual('realm');
  });

  test('if more than one account and no active account, display account list', () => {
    const state = deepFreeze({
      accounts: [{}, {}],
      nav: {
        routes: [],
      },
    });

    const nav = getInitialNavState(state);

    expect(nav.routes.length).toBe(1);
    expect(nav.routes[0].routeName).toEqual('account');
  });

  test('when only a single account and no other properties, redirect to realm', () => {
    const state = deepFreeze({
      accounts: [{ realm: 'https://example.com' }],
      nav: {
        routes: [],
      },
    });

    const nav = getInitialNavState(state);

    expect(nav.routes.length).toBe(1);
    expect(nav.routes[0].routeName).toEqual('realm');
  });

  test('when multiple accounts and default one has realm and email, show account list', () => {
    const state = deepFreeze({
      accounts: [
        { realm: 'https://example.com', email: 'johndoe@example.com' },
        { realm: 'https://example.com', email: 'janedoe@example.com' },
      ],
      nav: {
        routes: [],
      },
    });

    const nav = getInitialNavState(state);

    expect(nav.routes.length).toBe(1);
    expect(nav.routes[0].routeName).toEqual('account');
  });

  test('when default account has server and email set, redirect to realm screen', () => {
    const state = deepFreeze({
      accounts: [{ realm: 'https://example.com', email: 'johndoe@example.com' }],
      nav: {
        routes: [],
      },
    });

    const nav = getInitialNavState(state);

    expect(nav.routes.length).toBe(1);
    expect(nav.routes[0].routeName).toEqual('realm');
  });
});
