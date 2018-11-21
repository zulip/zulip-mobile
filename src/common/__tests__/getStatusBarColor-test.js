/* @flow */
import deepFreeze from 'deep-freeze';

import {
  HOME_NARROW,
  streamNarrow,
  topicNarrow,
  privateNarrow,
  MENTIONED_NARROW,
  groupNarrow,
} from '../../utils/narrow';
import { getTitleBackgroundColor } from '../../selectors';
import { defaultNav, otherNav } from '../../utils/testHelpers';
import { getStatusBarColor } from '../ZulipStatusBar';

const themeNight = 'night';
const themeDefault = 'default';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];

describe('getStatusBarColor', () => {
  test('return bar color according to theme for screens other than chat', () => {
    const state = deepFreeze({
      nav: otherNav,
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(HOME_NARROW)(state), themeDefault)).toEqual(
      'white',
    );
  });

  test('return bar color according to stream color for stream narrow in chat screen', () => {
    const state = deepFreeze({
      nav: defaultNav,
      subscriptions,
    });
    expect(
      getStatusBarColor(getTitleBackgroundColor(streamNarrow('all'))(state), themeDefault),
    ).toEqual('#fff');
  });

  test('return bar color according to stream color for topic narrow in main screen', () => {
    const state = deepFreeze({
      nav: defaultNav,
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
      nav: defaultNav,
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
      nav: defaultNav,
      subscriptions,
    });
    expect(getStatusBarColor(getTitleBackgroundColor(HOME_NARROW)(state), themeDefault)).toEqual(
      'white',
    );
  });

  test('returns color according to theme for group narrow', () => {
    const state = deepFreeze({
      nav: defaultNav,
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
      nav: defaultNav,
      subscriptions,
    });
    expect(
      getStatusBarColor(getTitleBackgroundColor(MENTIONED_NARROW)(state), themeDefault),
    ).toEqual('white');
  });
});
