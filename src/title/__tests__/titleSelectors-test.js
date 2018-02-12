/* @flow */
import deepFreeze from 'deep-freeze';

import { getTitleBackgroundColor, getTitleTextColor } from '../titleSelectors';
import { streamNarrow, privateNarrow } from '../../utils/narrow';
import { navStateWithNarrow } from '../../utils/testHelpers';
import { BRAND_COLOR } from '../../styles';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];
const defaultNav = {
  index: 0,
  routes: [{ routeName: 'chat' }],
};
const otherNav = {
  index: 1,
  routes: [{ routeName: 'main' }, { routeName: 'account' }],
};
describe('getTitleBackgroundColor', () => {
  test('return transparent color for account', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(streamNarrow('all')),
      subscriptions,
      nav: otherNav,
    });

    expect(getTitleBackgroundColor(state)).toEqual('transparent');
  });

  test('return stream color for stream and topic narrow', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(streamNarrow('all')),
      subscriptions,
    });

    expect(getTitleBackgroundColor(state)).toEqual('#fff');
  });

  test('return null stream color for invalid stream or unknown subscriptions', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(streamNarrow('feedback')),
      subscriptions,
    });

    expect(getTitleBackgroundColor(state)).toEqual('gray');
  });

  test('return transparent for other narrow and screens', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(privateNarrow('a@a.com')),
      subscriptions,
    });

    expect(getTitleBackgroundColor(state)).toEqual('transparent');
  });
});

describe('getTitleTextColor', () => {
  test('for account nav get use foregroundColorFromBackground', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(streamNarrow('all')),
      subscriptions,
      nav: otherNav,
    });

    expect(getTitleTextColor(state)).toEqual('rgba(82, 194, 175, 1)');
  });

  test('for stream and topic narrow get use foregroundColorFromBackground', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(streamNarrow('all')),
      subscriptions,
      nav: defaultNav,
    });

    expect(getTitleTextColor(state)).toEqual('rgba(82, 194, 175, 1)');
  });

  test('for other narrow get BRAND_COLOR', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(privateNarrow('a@a.com')),
      subscriptions,
      nav: defaultNav,
    });

    expect(getTitleTextColor(state)).toEqual(BRAND_COLOR);
  });
});
