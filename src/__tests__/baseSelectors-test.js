import deepFreeze from 'deep-freeze';

import {
  getActiveNarrow,
  getCurrentRoute,
  getCurrentRouteParams,
  getTopMostNarrow,
} from '../baseSelectors';
import { homeNarrow, streamNarrow } from '../utils/narrow';

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

describe('getCurrentRoute', () => {
  test('return name of the current route', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
    });
    const expectedResult = 'second';

    const actualResult = getCurrentRoute(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getCurrentRouteParams', () => {
  test('return params of the current route', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
    });
    const expectedResult = { email: 'b@a.com' };

    const actualResult = getCurrentRouteParams(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getTopMostNarrow', () => {
  test('return undefined if no chat screen are in stack', () => {
    const state = deepFreeze({
      nav: {
        index: 0,
        routes: [{ routeName: 'main' }],
      },
    });
    expect(getTopMostNarrow(state)).toBe(undefined);
  });

  test('return narrow of first chat screen from top', () => {
    const narrow = streamNarrow('all');
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [{ routeName: 'main' }, { routeName: 'chat', params: { narrow } }],
      },
    });
    expect(getTopMostNarrow(state)).toEqual(narrow);
  });

  test('iterate over stack to get first chat screen', () => {
    const narrow = streamNarrow('all');
    const state = deepFreeze({
      nav: {
        index: 2,
        routes: [
          { routeName: 'main' },
          { routeName: 'chat', params: { narrow } },
          { routeName: 'account' },
        ],
      },
    });
    expect(getTopMostNarrow(state)).toEqual(narrow);
  });
});
