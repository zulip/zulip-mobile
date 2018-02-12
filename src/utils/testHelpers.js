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
