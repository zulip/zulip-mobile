/* @flow strict-local */
import type { Narrow } from '../types';
import type { NavigationState } from '../reduxTypes';

export const navStateWithNarrow = (narrow: Narrow): {| nav: NavigationState |} => ({
  nav: {
    key: 'StackRouterRoot',
    index: 1,
    isTransitioning: false,
    routes: [
      {
        key: 'id-1592948746166-1',
        params: {},
        routeName: 'main',
      },
      {
        key: 'id-1592948746166-2',
        routeName: 'chat',
        params: {
          narrow,
        },
      },
    ],
  },
});

export const defaultNav = {
  index: 0,
  routes: [{ routeName: 'chat' }],
};

export const otherNav = {
  index: 1,
  routes: [{ routeName: 'main' }, { routeName: 'account' }],
};
