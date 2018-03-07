/* @flow */
import type { Narrow } from '../types';

export const navStateWithNarrow = (narrow: Narrow): Object => ({
  nav: {
    index: 0,
    routes: [
      {
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
