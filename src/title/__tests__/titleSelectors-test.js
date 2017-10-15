/* @flow */
import deepFreeze from 'deep-freeze';

import { getTitleBackgroundColor, getTitleTextColor } from '../titleSelectors';
import {
  streamNarrow,
  topicNarrow,
  privateNarrow,
  specialNarrow,
  groupNarrow,
} from '../../utils/narrow';
import { foregroundColorFromBackground } from '../../utils/color';
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
    let state = deepFreeze({
      chat: { narrow: streamNarrow('all') },
      subscriptions,
      nav: otherNav,
    });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');

    state = deepFreeze({
      chat: { narrow: privateNarrow('hamlet@example.com') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');
  });

  test('return stream color for stream and topic narrow', () => {
    let state = deepFreeze({
      chat: { narrow: streamNarrow('all') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleBackgroundColor(state)).toEqual('#fff');

    state = deepFreeze({
      chat: { narrow: topicNarrow('announce', '@all') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleBackgroundColor(state)).toEqual('#000');
  });

  test('return null stream color for invalid stream or unknown subscriptions', () => {
    const state = deepFreeze({
      chat: { narrow: streamNarrow('feedback') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleBackgroundColor(state)).toEqual('gray');
  });

  test('return transparent for other narrow and screens', () => {
    let state = deepFreeze({
      chat: { narrow: privateNarrow('a@a.com') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');

    state = deepFreeze({
      chat: { narrow: groupNarrow(['a@a.com', 'b@b.com']) },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');

    state = deepFreeze({
      chat: { narrow: [] },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');

    state = deepFreeze({
      chat: { narrow: specialNarrow('private') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');
  });
});

describe('getTitleTextColor', () => {
  test('for account nav get use foregroundColorFromBackground', () => {
    let state = deepFreeze({
      chat: { narrow: streamNarrow('all') },
      subscriptions,
      nav: otherNav,
    });
    expect(getTitleTextColor(state)).toEqual('rgba(82, 194, 175, 1)');

    state = deepFreeze({
      chat: { narrow: topicNarrow('announce', '@all') },
      subscriptions,
      nav: otherNav,
    });
    expect(getTitleTextColor(state)).toEqual('rgba(82, 194, 175, 1)');
  });

  test('for stream and topic narrow get use foregroundColorFromBackground', () => {
    let state = deepFreeze({
      chat: { narrow: streamNarrow('all') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleTextColor(state)).toEqual(foregroundColorFromBackground('#fff'));

    state = deepFreeze({
      chat: { narrow: topicNarrow('announce', '@all') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleTextColor(state)).toEqual(foregroundColorFromBackground('#000'));
  });

  test('for other narrow get BRAND_COLOR', () => {
    let state = deepFreeze({
      chat: { narrow: privateNarrow('a@a.com') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleTextColor(state)).toEqual(BRAND_COLOR);

    state = deepFreeze({
      chat: { narrow: groupNarrow(['a@a.com', 'b@b.com']) },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleTextColor(state)).toEqual(BRAND_COLOR);

    state = deepFreeze({
      chat: { narrow: specialNarrow('search') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getTitleTextColor(state)).toEqual(BRAND_COLOR);
  });
});
