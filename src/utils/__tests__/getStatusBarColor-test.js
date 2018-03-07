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

const themeNight = 'night';
const themeDefault = 'default';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];

describe('getStatusBarColor', () => {
  test('return bar color according to theme for screens other than main', () => {
    const state = deepFreeze({
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(homeNarrow)(state), themeDefault)).toEqual(
      'white',
    );
  });

  test('return bar color according to stream color for stream narrow in main screen', () => {
    const state = deepFreeze({
      subscriptions,
    });
    expect(
      getStatusBarColor(getTitleBackgroundColor(streamNarrow('all'))(state), themeDefault),
    ).toEqual('#fff');
  });

  test('return bar color according to stream color for topic narrow in main screen', () => {
    const state = deepFreeze({
      subscriptions,
    });
    expect(
      getStatusBarColor(
        getTitleBackgroundColor(topicNarrow('all', 'announce'))(state),
        themeDefault,
      ),
    ).toEqual('#fff');
  });

  test('returns color according to theme for private narrow', () => {
    const state = deepFreeze({
      subscriptions,
    });
    expect(
      getStatusBarColor(
        getTitleBackgroundColor(privateNarrow('bob@example.com'))(state),
        themeDefault,
      ),
    ).toEqual('white');
    expect(
      getStatusBarColor(getTitleBackgroundColor('bob@example.com')(state), themeNight),
    ).toEqual('#212D3B');
  });

  test('returns color according to theme for home narrow', () => {
    const state = deepFreeze({
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(homeNarrow)(state), themeDefault)).toEqual(
      'white',
    );
  });

  test('returns color according to theme for group narrow', () => {
    const state = deepFreeze({
      subscriptions,
    });
    expect(
      getStatusBarColor(
        getTitleBackgroundColor(groupNarrow(['abc@zulip.com', 'def@zulip.com']))(state),
        themeDefault,
      ),
    ).toEqual('white');
  });

  test('returns color according to theme for  special narrow', () => {
    const state = deepFreeze({
      subscriptions,
    });
    expect(
      getStatusBarColor(getTitleBackgroundColor(specialNarrow('mentioned'))(state), themeDefault),
    ).toEqual('white');
  });
});
