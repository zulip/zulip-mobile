/* @flow */
import deepFreeze from 'deep-freeze';

import { streamNarrow, topicNarrow, privateNarrow, specialNarrow, groupNarrow } from '../narrow';
import getStatusBarColor from '../getStatusBarColor';
import { getTitleBackgroundColor } from '../../selectors';

const themeNight = 'night';
const themeDefault = 'default';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];
const defaultNav = {
  index: 0,
  routes: [{ routeName: 'chat' }],
};

describe('getStatusBarColor', () => {
  test('return bar color according to theme for screens other than main', () => {
    const state = deepFreeze({ chat: { narrow: [] }, subscriptions, nav: defaultNav });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');
  });

  test('return bar color according to stream color for stream and topic narrow in main screen', () => {
    let state = deepFreeze({
      chat: { narrow: streamNarrow('all') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('#fff');

    state = deepFreeze({
      chat: { narrow: topicNarrow('all', 'announce') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('#fff');
  });

  test('returns color according to theme for private, group, home and special narrow', () => {
    let state = deepFreeze({
      chat: { narrow: privateNarrow('abc@zulip.com') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');

    expect(getStatusBarColor(getTitleBackgroundColor(state), themeNight)).toEqual('#212D3B');

    state = deepFreeze({ chat: { narrow: [] }, subscriptions, nav: defaultNav });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');

    state = deepFreeze({
      chat: { narrow: groupNarrow(['abc@zulip.com', 'def@zulip.com']) },
      subscriptions,
      nav: defaultNav,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');

    state = deepFreeze({
      chat: { narrow: specialNarrow('private') },
      subscriptions,
      nav: defaultNav,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');
  });
});
