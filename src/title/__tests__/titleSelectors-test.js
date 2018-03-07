/* @flow */
import deepFreeze from 'deep-freeze';

import { getTitleBackgroundColor, getTitleTextColor } from '../titleSelectors';
import { streamNarrow, privateNarrow } from '../../utils/narrow';
import { BRAND_COLOR } from '../../styles';
import { defaultNav, otherNav } from '../../utils/testHelpers';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];

describe('getTitleBackgroundColor', () => {
  test('return transparent color for account', () => {
    const state = deepFreeze({
      nav: otherNav,
      subscriptions,
    });

    expect(getTitleBackgroundColor(streamNarrow('all'))(state)).toEqual('transparent');
  });

  test('return stream color for stream and topic narrow', () => {
    const state = deepFreeze({
      nav: defaultNav,
      subscriptions,
    });

    expect(getTitleBackgroundColor(streamNarrow('all'))(state)).toEqual('#fff');
  });

  test('return null stream color for invalid stream or unknown subscriptions', () => {
    const state = deepFreeze({
      nav: defaultNav,
      subscriptions,
    });

    expect(getTitleBackgroundColor(streamNarrow('feedback'))(state)).toEqual('gray');
  });

  test('return transparent for other narrow and screens', () => {
    const state = deepFreeze({
      nav: defaultNav,
      subscriptions,
    });

    expect(getTitleBackgroundColor(privateNarrow('abc@zulip.com'))(state)).toEqual('transparent');
  });
});

describe('getTitleTextColor', () => {
  test('for account nav get use foregroundColorFromBackground', () => {
    const state = deepFreeze({
      nav: otherNav,
      subscriptions,
    });

    expect(getTitleTextColor(streamNarrow('all'))(state)).toEqual('rgba(82, 194, 175, 1)');
  });

  test('for stream and topic narrow get use foregroundColorFromBackground', () => {
    const state = deepFreeze({
      nav: defaultNav,
      subscriptions,
    });

    expect(getTitleTextColor(streamNarrow('all'))(state)).toEqual('black');
  });

  test('for other narrow get BRAND_COLOR', () => {
    const state = deepFreeze({
      nav: defaultNav,
      subscriptions,
    });

    expect(getTitleTextColor(privateNarrow('abc@zulip.com'))(state)).toEqual(BRAND_COLOR);
  });
});
