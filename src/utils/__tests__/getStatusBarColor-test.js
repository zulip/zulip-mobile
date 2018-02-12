/* @flow */
import deepFreeze from 'deep-freeze';

import {
  homeNarrow,
  streamNarrow,
  topicNarrow,
  privateNarrow,
  specialNarrow,
  groupNarrow,
} from '../narrow';
import getStatusBarColor from '../getStatusBarColor';
import { getTitleBackgroundColor } from '../../selectors';
import { navStateWithNarrow } from '../../utils/testHelpers';

const themeNight = 'night';
const themeDefault = 'default';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];

describe('getStatusBarColor', () => {
  test('return bar color according to theme for screens other than main', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(homeNarrow),
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');
  });

  test('return bar color according to stream color for stream narrow in main screen', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(streamNarrow('all')),
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('#fff');
  });

  test('return bar color according to stream color for topic narrow in main screen', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(topicNarrow('all', 'announce')),
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('#fff');
  });

  test('returns color according to theme for private narrow', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(privateNarrow('abc@zulip.com')),
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeNight)).toEqual('#212D3B');
  });

  test('returns color according to theme for home narrow', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(homeNarrow),
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');
  });

  test('returns color according to theme for group narrow', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(groupNarrow(['abc@zulip.com', 'def@zulip.com'])),
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');
  });

  test('returns color according to theme for  special narrow', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(specialNarrow('private')),
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(state), themeDefault)).toEqual('white');
  });
});
