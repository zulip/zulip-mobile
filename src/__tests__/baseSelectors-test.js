import deepFreeze from 'deep-freeze';

import { getActiveNarrow } from '../baseSelectors';
import { homeNarrow } from '../utils/narrow';

describe('getActiveNarrow', () => {
  test('if not in chat route consider active narrow to be Home', () => {
    const state = deepFreeze({
      nav: {
        index: 0,
        routes: [
          {
            routeName: 'main',
          },
        ],
      },
    });

    const narrow = getActiveNarrow(state);

    expect(narrow).toEqual(homeNarrow);
  });

  test('if route is chat get the narrow from its parameters', () => {
    const state = deepFreeze({
      nav: {
        index: 0,
        routes: [
          {
            routeName: 'chat',
            params: {
              narrow: 'some narrow',
            },
          },
        ],
      },
    });

    const narrow = getActiveNarrow(state);

    expect(narrow).toEqual('some narrow');
  });

  test('if several chat routes in navigation history return the last one', () => {
    const state = deepFreeze({
      nav: {
        index: 2,
        routes: [
          {
            routeName: 'chat',
            params: {
              narrow: 'some narrow',
            },
          },
          {
            routeName: 'chat',
            params: {
              narrow: 'next narrow',
            },
          },
          {
            routeName: 'chat',
            params: {
              narrow: 'last narrow',
            },
          },
        ],
      },
    });

    const narrow = getActiveNarrow(state);

    expect(narrow).toEqual('last narrow');
  });
});
